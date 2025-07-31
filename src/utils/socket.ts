import { io, Socket } from 'socket.io-client';
import type { Message, TypingIndicator, OnlineStatus, SocketEvents } from '../types';
import { TokenManager } from './api';

class SocketService {
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private isConnecting = false;
  private eventListeners: Map<string, Set<Function>> = new Map();

  constructor() {
    // Auto-connect if user is authenticated
    if (typeof window !== 'undefined' && TokenManager.getAccessToken()) {
      this.connect();
    }
  }

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.socket?.connected || this.isConnecting) {
        resolve();
        return;
      }

      const token = TokenManager.getAccessToken();
      if (!token) {
        reject(new Error('No authentication token available'));
        return;
      }

      this.isConnecting = true;
      const socketUrl = import.meta.env.PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5000';

      this.socket = io(socketUrl, {
        auth: {
          token: token
        },
        transports: ['websocket', 'polling'],
        timeout: 10000,
        reconnection: true,
        reconnectionAttempts: this.maxReconnectAttempts,
        reconnectionDelay: this.reconnectDelay,
      });

      this.socket.on('connect', () => {
        console.log('Socket connected:', this.socket?.id);
        this.isConnecting = false;
        this.reconnectAttempts = 0;
        this.emit('connect');
        resolve();
      });

      this.socket.on('disconnect', (reason: string) => {
        console.log('Socket disconnected:', reason);
        this.isConnecting = false;
        this.emit('disconnect', reason);
      });

      this.socket.on('connect_error', (error: Error) => {
        console.error('Socket connection error:', error);
        this.isConnecting = false;
        this.reconnectAttempts++;
        
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
          this.emit('error', error);
          reject(error);
        }
      });

      // Set up message event listeners
      this.setupMessageListeners();
    });
  }

  private setupMessageListeners(): void {
    if (!this.socket) return;

    // Message events
    this.socket.on('new_message', (message: Message) => {
      this.emit('new_message', message);
    });

    this.socket.on('message_sent', (message: Message) => {
      this.emit('message_sent', message);
    });

    // Typing events
    this.socket.on('user_typing', (data: { userId: string; conversationId: string; isTyping: boolean }) => {
      this.emit('user_typing', data);
    });

    // Read status events
    this.socket.on('messages_read', (data: { conversationId: string; messageIds: string[]; readBy: string }) => {
      this.emit('messages_read', data);
    });

    // Online status events
    this.socket.on('user_online', (data: { userId: string; isOnline: boolean }) => {
      this.emit('user_online', data);
    });

    this.socket.on('conversation_online_users', (data: { conversationId: string; onlineUsers: string[] }) => {
      this.emit('conversation_online_users', data);
    });

    // Conversation events
    this.socket.on('conversation_joined', (conversationId: string) => {
      this.emit('conversation_joined', conversationId);
    });

    this.socket.on('conversation_left', (conversationId: string) => {
      this.emit('conversation_left', conversationId);
    });
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.isConnecting = false;
    this.eventListeners.clear();
  }

  // Event listener management
  on<K extends keyof SocketEvents>(event: K, callback: SocketEvents[K]): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, new Set());
    }
    this.eventListeners.get(event)!.add(callback);
  }

  off<K extends keyof SocketEvents>(event: K, callback: SocketEvents[K]): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.delete(callback);
    }
  }

  private emit(event: string, ...args: any[]): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.forEach(callback => {
        try {
          callback(...args);
        } catch (error) {
          console.error(`Error in socket event listener for ${event}:`, error);
        }
      });
    }
  }

  // Messaging methods
  sendMessage(data: { conversationId: string; content: string; messageType?: string; replyToMessageId?: string }): void {
    if (!this.socket?.connected) {
      throw new Error('Socket not connected');
    }
    this.socket.emit('send_message', data);
  }

  // Typing indicators
  startTyping(conversationId: string): void {
    if (!this.socket?.connected) return;
    this.socket.emit('typing_start', { conversationId });
  }

  stopTyping(conversationId: string): void {
    if (!this.socket?.connected) return;
    this.socket.emit('typing_stop', { conversationId });
  }

  // Read status
  markMessagesAsRead(conversationId: string, messageIds?: string[]): void {
    if (!this.socket?.connected) return;
    this.socket.emit('mark_messages_read', { conversationId, messageIds });
  }

  // Conversation management
  joinConversation(conversationId: string): void {
    if (!this.socket?.connected) return;
    this.socket.emit('join_conversation', conversationId);
  }

  leaveConversation(conversationId: string): void {
    if (!this.socket?.connected) return;
    this.socket.emit('leave_conversation', conversationId);
  }

  // Online status
  getConversationOnlineUsers(conversationId: string): void {
    if (!this.socket?.connected) return;
    this.socket.emit('get_conversation_online_users', conversationId);
  }

  // Connection status
  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  getSocketId(): string | undefined {
    return this.socket?.id;
  }

  // Reconnect manually
  async reconnect(): Promise<void> {
    this.disconnect();
    await this.connect();
  }
}

// Create singleton instance
export const socketService = new SocketService();

// Export for use in components
export default socketService; 