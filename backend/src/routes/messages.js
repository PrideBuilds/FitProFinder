import express from 'express';
import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import fs from 'fs';
import { authenticate } from '../middleware/auth.js';
import messagingService from '../services/messagingService.js';
import socketService from '../services/socketService.js';
import ApiError from '../utils/ApiError.js';

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/messages';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Allow images, documents, and common file types
    const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx|txt|mp4|mov|avi/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Invalid file type'));
    }
  }
});

/**
 * @swagger
 * /api/messages/conversations:
 *   get:
 *     summary: Get user's conversations
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *     responses:
 *       200:
 *         description: List of conversations
 */
router.get('/conversations', authenticate, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const conversations = await messagingService.getUserConversations(
      req.user.id,
      req.user.role,
      parseInt(page),
      parseInt(limit)
    );

    res.json({
      success: true,
      data: {
        conversations,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: conversations.length
        }
      }
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * @swagger
 * /api/messages/conversations:
 *   post:
 *     summary: Create or get conversation
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               participantId:
 *                 type: string
 *                 description: ID of the other participant
 *     responses:
 *       200:
 *         description: Conversation created or retrieved
 */
router.post('/conversations', authenticate, async (req, res) => {
  try {
    const { participantId } = req.body;
    const userId = req.user.id;
    const userRole = req.user.role;

    if (!participantId) {
      throw new ApiError('Participant ID is required', 400);
    }

    let conversation;
    if (userRole === 'client') {
      conversation = await messagingService.createOrGetConversation(userId, participantId);
    } else {
      conversation = await messagingService.createOrGetConversation(participantId, userId);
    }

    res.json({
      success: true,
      data: { conversation }
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * @swagger
 * /api/messages/conversations/{conversationId}/messages:
 *   get:
 *     summary: Get messages for a conversation
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: conversationId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *     responses:
 *       200:
 *         description: List of messages
 */
router.get('/conversations/:conversationId/messages', authenticate, async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { page = 1, limit = 50 } = req.query;

    const messages = await messagingService.getConversationMessages(
      conversationId,
      req.user.id,
      parseInt(page),
      parseInt(limit)
    );

    res.json({
      success: true,
      data: messages,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: messages.length
      }
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * @swagger
 * /api/messages/conversations/{conversationId}/messages:
 *   post:
 *     summary: Send a message
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: conversationId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               receiverId:
 *                 type: string
 *               content:
 *                 type: string
 *               messageType:
 *                 type: string
 *                 enum: [text, image, file, system]
 *                 default: text
 *               metadata:
 *                 type: object
 *     responses:
 *       201:
 *         description: Message sent successfully
 */
router.post('/conversations/:conversationId/messages', authenticate, async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { receiverId, content, messageType = 'text', metadata } = req.body;

    if (!receiverId || !content) {
      throw new ApiError('Receiver ID and content are required', 400);
    }

    const message = await messagingService.sendMessage(
      req.user.id,
      receiverId,
      conversationId,
      content,
      messageType,
      metadata
    );

    // Emit real-time message
    socketService.sendToConversation(conversationId, 'new_message', message);

    res.status(201).json({
      success: true,
      data: message
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * @swagger
 * /api/messages/conversations/{conversationId}/read:
 *   post:
 *     summary: Mark messages as read
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: conversationId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Messages marked as read
 */
router.post('/conversations/:conversationId/read', authenticate, async (req, res) => {
  try {
    const { conversationId } = req.params;
    
    await messagingService.markMessagesAsRead(conversationId, req.user.id);

    // Emit read status
    socketService.sendToConversation(conversationId, 'messages_read', {
      conversationId,
      readByUserId: req.user.id,
      readAt: new Date()
    });

    res.json({
      success: true,
      data: {
        message: 'Messages marked as read',
        readByUserId: req.user.id,
        conversationId
      }
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * @swagger
 * /api/messages/upload:
 *   post:
 *     summary: Upload file for message
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *               conversationId:
 *                 type: string
 *               receiverId:
 *                 type: string
 *     responses:
 *       201:
 *         description: File uploaded and message sent
 */
router.post('/upload', authenticate, upload.single('file'), async (req, res) => {
  try {
    const { conversationId, receiverId } = req.body;
    
    if (!req.file) {
      throw new ApiError('No file uploaded', 400);
    }

    if (!conversationId || !receiverId) {
      throw new ApiError('Conversation ID and receiver ID are required', 400);
    }

    const fileUrl = `/uploads/messages/${req.file.filename}`;
    const messageType = req.file.mimetype.startsWith('image/') ? 'image' : 'file';
    
    const metadata = {
      fileName: req.file.originalname,
      fileSize: req.file.size,
      mimeType: req.file.mimetype,
      fileUrl: fileUrl
    };

    const message = await messagingService.sendMessage(
      req.user.id,
      receiverId,
      conversationId,
      req.file.originalname, // Use filename as content
      messageType,
      metadata
    );

    // Emit real-time message
    socketService.sendToConversation(conversationId, 'new_message', message);

    res.status(201).json({
      success: true,
      data: message
    });
  } catch (error) {
    // Clean up uploaded file if message creation failed
    if (req.file) {
      fs.unlink(req.file.path, (err) => {
        if (err) console.error('Error deleting file:', err);
      });
    }
    
    res.status(error.statusCode || 500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * @swagger
 * /api/messages/search:
 *   get:
 *     summary: Search messages
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *     responses:
 *       200:
 *         description: Search results
 */
router.get('/search', authenticate, async (req, res) => {
  try {
    const { q: query, page = 1, limit = 20 } = req.query;

    if (!query) {
      throw new ApiError('Search query is required', 400);
    }

    const results = await messagingService.searchMessages(
      req.user.id,
      query,
      parseInt(page),
      parseInt(limit)
    );

    res.json({
      success: true,
      data: results,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: results.length
      }
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * @swagger
 * /api/messages/conversations/{conversationId}/stats:
 *   get:
 *     summary: Get conversation statistics
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: conversationId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Conversation statistics
 */
router.get('/conversations/:conversationId/stats', authenticate, async (req, res) => {
  try {
    const { conversationId } = req.params;
    
    const stats = await messagingService.getConversationStats(conversationId, req.user.id);

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * @swagger
 * /api/messages/socket/stats:
 *   get:
 *     summary: Get WebSocket server statistics
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Socket server statistics
 */
router.get('/socket/stats', authenticate, async (req, res) => {
  try {
    const stats = socketService.getStats();

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

export default router; 