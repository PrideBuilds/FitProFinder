import { v4 as uuidv4 } from 'uuid';
import db from '../database/connection.js';
import ApiError from '../utils/ApiError.js';

class MessagingService {
  /**
   * Create or get existing conversation between client and trainer
   */
  async createOrGetConversation(clientId, trainerId) {
    try {
      // Check if conversation already exists
      let conversation = await db('conversations')
        .where({ client_id: clientId, trainer_id: trainerId })
        .first();

      if (!conversation) {
        // Create new conversation
        const conversationId = uuidv4();
        
        await db('conversations').insert({
          id: conversationId,
          client_id: clientId,
          trainer_id: trainerId,
          status: 'active',
          total_messages: 0,
          client_unread_count: 0,
          trainer_unread_count: 0,
          created_at: new Date(),
          updated_at: new Date()
        });

        conversation = await db('conversations')
          .where({ id: conversationId })
          .first();
      }

      return conversation;
    } catch (error) {
      throw new ApiError('Failed to create or get conversation', 500);
    }
  }

  /**
   * Get all conversations for a user
   */
  async getUserConversations(userId, userRole, page = 1, limit = 20) {
    try {
      const offset = (page - 1) * limit;
      
      const query = db('conversations as c')
        .select(
          'c.*',
          'client.first_name as client_first_name',
          'client.last_name as client_last_name',
          'client.profile_image_url as client_profile_image',
          'trainer.first_name as trainer_first_name',
          'trainer.last_name as trainer_last_name',
          'trainer.profile_image_url as trainer_profile_image'
        )
        .leftJoin('users as client', 'c.client_id', 'client.id')
        .leftJoin('users as trainer', 'c.trainer_id', 'trainer.id')
        .orderBy('c.last_message_at', 'desc')
        .limit(limit)
        .offset(offset);

      if (userRole === 'client') {
        query.where('c.client_id', userId);
      } else {
        query.where('c.trainer_id', userId);
      }

      const conversations = await query;

      // Format conversations with participant info
      const formattedConversations = conversations.map(conv => ({
        id: conv.id,
        title: conv.title,
        status: conv.status,
        lastMessagePreview: conv.last_message_preview,
        lastMessageAt: conv.last_message_at,
        totalMessages: conv.total_messages,
        unreadCount: userRole === 'client' ? conv.client_unread_count : conv.trainer_unread_count,
        participant: userRole === 'client' ? {
          id: conv.trainer_id,
          firstName: conv.trainer_first_name,
          lastName: conv.trainer_last_name,
          profileImage: conv.trainer_profile_image,
          role: 'trainer'
        } : {
          id: conv.client_id,
          firstName: conv.client_first_name,
          lastName: conv.client_last_name,
          profileImage: conv.client_profile_image,
          role: 'client'
        },
        createdAt: conv.created_at,
        updatedAt: conv.updated_at
      }));

      return formattedConversations;
    } catch (error) {
      console.error('Error in getUserConversations:', error);
      throw new ApiError('Failed to get user conversations', 500);
    }
  }

  /**
   * Send a new message
   */
  async sendMessage(senderId, receiverId, conversationId, content, messageType = 'text', metadata = null) {
    const trx = await db.transaction();
    
    try {
      const messageId = uuidv4();
      const now = new Date().toISOString();

      // Insert message
      await trx('messages').insert({
        id: messageId,
        conversation_id: conversationId,
        sender_id: senderId,
        receiver_id: receiverId,
        message_type: messageType,
        content: content,
        metadata: metadata ? JSON.stringify(metadata) : null,
        status: 'sent',
        created_at: now,
        updated_at: now
      });

      // Get current conversation data
      const conversation = await trx('conversations').where({ id: conversationId }).first();
      if (!conversation) {
        throw new Error('Conversation not found');
      }

      // Update conversation
      const senderRole = await this.getUserRole(senderId, trx);
      
      const updateData = {
        last_message_preview: content.substring(0, 100),
        last_message_at: now,
        total_messages: conversation.total_messages + 1,
        updated_at: now
      };

      // Increment unread count for receiver
      if (senderRole === 'client') {
        updateData.trainer_unread_count = conversation.trainer_unread_count + 1;
      } else {
        updateData.client_unread_count = conversation.client_unread_count + 1;
      }

      await trx('conversations')
        .where({ id: conversationId })
        .update(updateData);

      await trx.commit();

      // Return basic message data
      const message = {
        id: messageId,
        conversationId: conversationId,
        senderId: senderId,
        receiverId: receiverId,
        messageType: messageType,
        content: content,
        metadata: metadata ? JSON.parse(metadata) : null,
        status: 'sent',
        createdAt: now,
        updatedAt: now
      };
      
      return message;
    } catch (error) {
      await trx.rollback();
      console.error('Error in sendMessage:', error);
      throw new ApiError('Failed to send message', 500);
    }
  }

  /**
   * Get messages for a conversation
   */
  async getConversationMessages(conversationId, userId, page = 1, limit = 50) {
    try {
      const offset = (page - 1) * limit;

      // Verify user has access to this conversation
      const conversation = await db('conversations')
        .where({ id: conversationId })
        .where(function() {
          this.where('client_id', userId).orWhere('trainer_id', userId);
        })
        .first();

      if (!conversation) {
        throw new ApiError('Conversation not found or access denied', 404);
      }

      const messages = await db('messages as m')
        .select(
          'm.*',
          'sender.first_name as sender_first_name',
          'sender.last_name as sender_last_name',
          'sender.profile_image_url as sender_profile_image',
          'sender.role as sender_role'
        )
        .leftJoin('users as sender', 'm.sender_id', 'sender.id')
        .where('m.conversation_id', conversationId)
        .orderBy('m.created_at', 'desc')
        .limit(limit)
        .offset(offset);

      // Get attachments for messages
      const messageIds = messages.map(m => m.id);
      const attachments = messageIds.length > 0 ? await db('message_attachments')
        .whereIn('message_id', messageIds) : [];

      // Group attachments by message
      const attachmentsByMessage = attachments.reduce((acc, attachment) => {
        if (!acc[attachment.message_id]) {
          acc[attachment.message_id] = [];
        }
        acc[attachment.message_id].push(attachment);
        return acc;
      }, {});

      // Format messages
      const formattedMessages = messages.map(msg => ({
        id: msg.id,
        conversationId: msg.conversation_id,
        senderId: msg.sender_id,
        receiverId: msg.receiver_id,
        messageType: msg.message_type,
        content: msg.content,
        metadata: msg.metadata ? JSON.parse(msg.metadata) : null,
        status: msg.status,
        deliveredAt: msg.delivered_at,
        readAt: msg.read_at,
        replyToMessageId: msg.reply_to_message_id,
        attachments: attachmentsByMessage[msg.id] || [],
        sender: {
          id: msg.sender_id,
          firstName: msg.sender_first_name,
          lastName: msg.sender_last_name,
          profileImage: msg.sender_profile_image,
          role: msg.sender_role
        },
        createdAt: msg.created_at,
        updatedAt: msg.updated_at
      }));

      return formattedMessages.reverse(); // Return in chronological order
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError('Failed to get conversation messages', 500);
    }
  }

  /**
   * Mark messages as read
   */
  async markMessagesAsRead(conversationId, userId) {
    const trx = await db.transaction();
    
    try {
      const now = new Date();

      // Mark unread messages as read
      await trx('messages')
        .where({
          conversation_id: conversationId,
          receiver_id: userId,
          status: 'sent'
        })
        .update({
          status: 'read',
          read_at: now,
          updated_at: now
        });

      // Reset unread count for user
      const userRole = await this.getUserRole(userId);
      const updateField = userRole === 'client' ? 'client_unread_count' : 'trainer_unread_count';
      
      await trx('conversations')
        .where({ id: conversationId })
        .update({
          [updateField]: 0,
          updated_at: now
        });

      await trx.commit();
      return true;
    } catch (error) {
      await trx.rollback();
      throw new ApiError('Failed to mark messages as read', 500);
    }
  }

  /**
   * Get message by ID
   */
  async getMessageById(messageId) {
    try {
      const message = await db('messages as m')
        .select(
          'm.*',
          'sender.first_name as sender_first_name',
          'sender.last_name as sender_last_name',
          'sender.profile_image_url as sender_profile_image',
          'sender.role as sender_role'
        )
        .leftJoin('users as sender', 'm.sender_id', 'sender.id')
        .where('m.id', messageId)
        .first();

      if (!message) {
        throw new ApiError('Message not found', 404);
      }

      // Get attachments
      const attachments = await db('message_attachments')
        .where('message_id', messageId);

      return {
        id: message.id,
        conversationId: message.conversation_id,
        senderId: message.sender_id,
        receiverId: message.receiver_id,
        messageType: message.message_type,
        content: message.content,
        metadata: message.metadata ? JSON.parse(message.metadata) : null,
        status: message.status,
        deliveredAt: message.delivered_at,
        readAt: message.read_at,
        replyToMessageId: message.reply_to_message_id,
        attachments: attachments,
        sender: {
          id: message.sender_id,
          firstName: message.sender_first_name,
          lastName: message.sender_last_name,
          profileImage: message.sender_profile_image,
          role: message.sender_role
        },
        createdAt: message.created_at,
        updatedAt: message.updated_at
      };
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError('Failed to get message', 500);
    }
  }

  /**
   * Get user role
   */
  async getUserRole(userId, trx = null) {
    const query = trx ? trx('users') : db('users');
    const user = await query.select('role').where({ id: userId }).first();
    return user?.role;
  }

  /**
   * Search messages
   */
  async searchMessages(userId, query, page = 1, limit = 20) {
    try {
      const offset = (page - 1) * limit;

      const messages = await db('messages as m')
        .select(
          'm.*',
          'c.client_id',
          'c.trainer_id',
          'sender.first_name as sender_first_name',
          'sender.last_name as sender_last_name',
          'sender.profile_image_url as sender_profile_image'
        )
        .leftJoin('conversations as c', 'm.conversation_id', 'c.id')
        .leftJoin('users as sender', 'm.sender_id', 'sender.id')
        .where(function() {
          this.where('c.client_id', userId).orWhere('c.trainer_id', userId);
        })
        .where('m.content', 'like', `%${query}%`)
        .orderBy('m.created_at', 'desc')
        .limit(limit)
        .offset(offset);

      return messages.map(msg => ({
        id: msg.id,
        conversationId: msg.conversation_id,
        content: msg.content,
        messageType: msg.message_type,
        sender: {
          id: msg.sender_id,
          firstName: msg.sender_first_name,
          lastName: msg.sender_last_name,
          profileImage: msg.sender_profile_image
        },
        createdAt: msg.created_at
      }));
    } catch (error) {
      throw new ApiError('Failed to search messages', 500);
    }
  }

  /**
   * Get conversation statistics
   */
  async getConversationStats(conversationId, userId) {
    try {
      // Verify access
      const conversation = await db('conversations')
        .where({ id: conversationId })
        .where(function() {
          this.where('client_id', userId).orWhere('trainer_id', userId);
        })
        .first();

      if (!conversation) {
        throw new ApiError('Conversation not found or access denied', 404);
      }

      const stats = await db('messages')
        .where({ conversation_id: conversationId })
        .select(
          db.raw('COUNT(*) as total_messages'),
          db.raw('COUNT(CASE WHEN sender_id = ? THEN 1 END) as sent_by_user', [userId]),
          db.raw('COUNT(CASE WHEN receiver_id = ? THEN 1 END) as received_by_user', [userId]),
          db.raw('COUNT(CASE WHEN message_type = "image" THEN 1 END) as image_count'),
          db.raw('COUNT(CASE WHEN message_type = "file" THEN 1 END) as file_count')
        )
        .first();

      return {
        conversationId,
        totalMessages: parseInt(stats.total_messages),
        sentByUser: parseInt(stats.sent_by_user),
        receivedByUser: parseInt(stats.received_by_user),
        imageCount: parseInt(stats.image_count),
        fileCount: parseInt(stats.file_count),
        lastMessageAt: conversation.last_message_at
      };
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError('Failed to get conversation stats', 500);
    }
  }
}

export default new MessagingService(); 