import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import messagingService from './messagingService.js';

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production';

class SocketService {
  constructor() {
    this.io = null;
    this.connectedUsers = new Map(); // userId -> { socketId, userInfo, lastSeen }
    this.typingUsers = new Map(); // conversationId -> Set of userIds
  }

  /**
   * Initialize Socket.IO server
   */
  initialize(server) {
    this.io = new Server(server, {
      cors: {
        origin: [
          "http://localhost:4321",
          "http://localhost:4322", 
          "http://localhost:4323",
          "http://localhost:4324",
          process.env.FRONTEND_URL
        ].filter(Boolean),
        methods: ["GET", "POST"],
        credentials: true
      },
      allowEIO3: true,
      transports: ['websocket', 'polling']
    });

    // Authentication middleware
    this.io.use(async (socket, next) => {
      try {
        const token = socket.handshake.auth.token;
        console.log(`🔍 Socket auth attempt - Token received: ${token ? 'YES' : 'NO'}`);
        console.log(`🔍 Token preview: ${token ? token.substring(0, 50) + '...' : 'N/A'}`);
        console.log(`🔍 JWT_SECRET being used: ${JWT_SECRET}`);
        console.log(`🔍 JWT_SECRET length: ${JWT_SECRET.length}`);
        
        if (!token) {
          return next(new Error('Authentication error: No token provided'));
        }

        console.log(`🔍 About to verify token with options:`, {
          issuer: 'fitprofinder-api',
          audience: 'fitprofinder-app'
        });

        // Verify token with same options as REST API
        const decoded = jwt.verify(token, JWT_SECRET, {
          issuer: 'fitprofinder-api',
          audience: 'fitprofinder-app'
        });
        
        console.log(`🔍 Token decoded successfully:`, {
          userId: decoded.userId,
          email: decoded.email,
          role: decoded.role
        });
        
        socket.userId = decoded.userId;
        socket.userRole = decoded.role;
        socket.userEmail = decoded.email;
        
        console.log(`🔐 Socket authenticated for user: ${decoded.userId} (${decoded.email})`);
        next();
      } catch (error) {
        console.error('🚨 Socket authentication error details:', {
          message: error.message,
          name: error.name,
          stack: error.stack,
          tokenPreview: socket.handshake.auth.token ? socket.handshake.auth.token.substring(0, 50) + '...' : 'N/A'
        });
        next(new Error('Authentication error: Invalid token'));
      }
    });

    // Connection handling
    this.io.on('connection', (socket) => {
      this.handleConnection(socket);
    });

    console.log('✅ Socket.IO server initialized');
  }

  /**
   * Handle new socket connection
   */
  handleConnection(socket) {
    const userId = socket.userId;
    
    // Store user connection
    this.connectedUsers.set(userId, {
      socketId: socket.id,
      userRole: socket.userRole,
      userEmail: socket.userEmail,
      lastSeen: new Date(),
      isOnline: true
    });

    console.log(`👤 User ${userId} connected (${socket.userEmail})`);

    // Join user to their personal room
    socket.join(`user:${userId}`);

    // Emit online status to relevant conversations
    this.broadcastUserOnlineStatus(userId, true);

    // Handle events
    this.setupEventHandlers(socket);

    // Handle disconnection
    socket.on('disconnect', () => {
      this.handleDisconnection(socket);
    });
  }

  /**
   * Setup event handlers for socket
   */
  setupEventHandlers(socket) {
    const userId = socket.userId;

    // Join conversation room
    socket.on('join_conversation', (conversationId) => {
      socket.join(`conversation:${conversationId}`);
      console.log(`👤 User ${userId} joined conversation ${conversationId}`);
    });

    // Leave conversation room
    socket.on('leave_conversation', (conversationId) => {
      socket.leave(`conversation:${conversationId}`);
      console.log(`👤 User ${userId} left conversation ${conversationId}`);
    });

    // Send message
    socket.on('send_message', async (data) => {
      try {
        const { conversationId, receiverId, content, messageType = 'text', metadata } = data;
        
        // Send message through service
        const message = await messagingService.sendMessage(
          userId,
          receiverId,
          conversationId,
          content,
          messageType,
          metadata
        );

        // Emit to conversation room
        this.io.to(`conversation:${conversationId}`).emit('new_message', message);
        
        // Send push notification to receiver if offline
        if (!this.isUserOnline(receiverId)) {
          this.sendPushNotification(receiverId, message);
        }

        // Acknowledge to sender
        socket.emit('message_sent', { messageId: message.id, status: 'sent' });
        
      } catch (error) {
        socket.emit('message_error', { error: error.message });
      }
    });

    // Typing indicators
    socket.on('typing_start', (data) => {
      const { conversationId } = data;
      this.handleTypingStart(userId, conversationId);
      socket.to(`conversation:${conversationId}`).emit('user_typing', {
        userId,
        conversationId,
        isTyping: true
      });
    });

    socket.on('typing_stop', (data) => {
      const { conversationId } = data;
      this.handleTypingStop(userId, conversationId);
      socket.to(`conversation:${conversationId}`).emit('user_typing', {
        userId,
        conversationId,
        isTyping: false
      });
    });

    // Mark messages as read
    socket.on('mark_messages_read', async (data) => {
      try {
        const { conversationId } = data;
        await messagingService.markMessagesAsRead(conversationId, userId);
        
        // Notify other participants
        socket.to(`conversation:${conversationId}`).emit('messages_read', {
          conversationId,
          readByUserId: userId,
          readAt: new Date()
        });
        
      } catch (error) {
        socket.emit('read_error', { error: error.message });
      }
    });

    // Request online users for conversation
    socket.on('get_conversation_online_users', (conversationId) => {
      const onlineUsers = this.getConversationOnlineUsers(conversationId);
      socket.emit('conversation_online_users', { conversationId, onlineUsers });
    });
  }

  /**
   * Handle socket disconnection
   */
  handleDisconnection(socket) {
    const userId = socket.userId;
    
    // Update user status
    if (this.connectedUsers.has(userId)) {
      const userInfo = this.connectedUsers.get(userId);
      userInfo.isOnline = false;
      userInfo.lastSeen = new Date();
      
      // Remove from connected users after a delay (in case of reconnection)
      setTimeout(() => {
        if (this.connectedUsers.has(userId) && !this.connectedUsers.get(userId).isOnline) {
          this.connectedUsers.delete(userId);
        }
      }, 30000); // 30 seconds grace period
    }

    // Clear typing indicators
    this.clearUserTyping(userId);

    // Broadcast offline status
    this.broadcastUserOnlineStatus(userId, false);

    console.log(`👤 User ${userId} disconnected`);
  }

  /**
   * Handle typing start
   */
  handleTypingStart(userId, conversationId) {
    if (!this.typingUsers.has(conversationId)) {
      this.typingUsers.set(conversationId, new Set());
    }
    this.typingUsers.get(conversationId).add(userId);

    // Auto-stop typing after 3 seconds
    setTimeout(() => {
      this.handleTypingStop(userId, conversationId);
    }, 3000);
  }

  /**
   * Handle typing stop
   */
  handleTypingStop(userId, conversationId) {
    if (this.typingUsers.has(conversationId)) {
      this.typingUsers.get(conversationId).delete(userId);
      if (this.typingUsers.get(conversationId).size === 0) {
        this.typingUsers.delete(conversationId);
      }
    }
  }

  /**
   * Clear all typing indicators for user
   */
  clearUserTyping(userId) {
    for (const [conversationId, typingSet] of this.typingUsers.entries()) {
      if (typingSet.has(userId)) {
        typingSet.delete(userId);
        if (typingSet.size === 0) {
          this.typingUsers.delete(conversationId);
        }
        // Notify conversation that user stopped typing
        this.io.to(`conversation:${conversationId}`).emit('user_typing', {
          userId,
          conversationId,
          isTyping: false
        });
      }
    }
  }

  /**
   * Check if user is online
   */
  isUserOnline(userId) {
    return this.connectedUsers.has(userId) && this.connectedUsers.get(userId).isOnline;
  }

  /**
   * Get online users for a conversation
   */
  getConversationOnlineUsers(conversationId) {
    const onlineUsers = [];
    for (const [userId, userInfo] of this.connectedUsers.entries()) {
      if (userInfo.isOnline) {
        onlineUsers.push({
          userId,
          userRole: userInfo.userRole,
          lastSeen: userInfo.lastSeen
        });
      }
    }
    return onlineUsers;
  }

  /**
   * Broadcast user online status to relevant conversations
   */
  async broadcastUserOnlineStatus(userId, isOnline) {
    try {
      // Get user's conversations to notify participants
      const userRole = this.connectedUsers.get(userId)?.userRole;
      if (userRole) {
        const conversations = await messagingService.getUserConversations(userId, userRole, 1, 100);
        
        conversations.forEach(conversation => {
          this.io.to(`conversation:${conversation.id}`).emit('user_online_status', {
            userId,
            isOnline,
            lastSeen: new Date()
          });
        });
      }
    } catch (error) {
      console.error('Error broadcasting online status:', error);
    }
  }

  /**
   * Send push notification (placeholder for future implementation)
   */
  sendPushNotification(userId, message) {
    // TODO: Implement push notifications
    console.log(`📱 Push notification for user ${userId}: ${message.content.substring(0, 50)}...`);
  }

  /**
   * Send message to specific user
   */
  sendToUser(userId, event, data) {
    this.io.to(`user:${userId}`).emit(event, data);
  }

  /**
   * Send message to conversation
   */
  sendToConversation(conversationId, event, data) {
    this.io.to(`conversation:${conversationId}`).emit(event, data);
  }

  /**
   * Get connected users count
   */
  getConnectedUsersCount() {
    return this.connectedUsers.size;
  }

  /**
   * Get server statistics
   */
  getStats() {
    return {
      connectedUsers: this.connectedUsers.size,
      activeConversations: this.typingUsers.size,
      totalSockets: this.io.engine.clientsCount
    };
  }
}

export default new SocketService(); 