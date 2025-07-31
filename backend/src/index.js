// Load environment variables first, before any other imports
import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import { createServer } from 'http';
import 'express-async-errors';

// Import routes
import authRoutes from './routes/auth.js';
// import userRoutes from './routes/users.js';
import trainerRoutes from './routes/trainers.js';
import bookingRoutes from './routes/bookings.js';
import calendarRoutes from './routes/calendar.js';
import paymentRoutes from './routes/payments.js';
import messageRoutes from './routes/messages.js';
import adminRoutes from './routes/admin.js';
// import reviewRoutes from './routes/reviews.js';
// import searchRoutes from './routes/search.js';
// import adminRoutes from './routes/admin.js';

// Import middleware
import { errorHandler } from './middleware/errorHandler.js';
import { logger } from './utils/logger.js';
// import { setupSwagger } from './utils/swagger.js';

// Import services
import socketService from './services/socketService.js';

const app = express();
const server = createServer(app);

const PORT = process.env.PORT || 5000;

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "fonts.googleapis.com"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      fontSrc: ["'self'", "fonts.gstatic.com"],
    },
  },
}));

app.use(cors({
  origin: [
    "http://localhost:4321",
    "http://localhost:4322", 
    "http://localhost:4323",
    "http://localhost:4324",
    process.env.FRONTEND_URL
  ].filter(Boolean),
  credentials: true
}));

app.use(compression());
app.use(limiter);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve static files for uploads
app.use('/uploads', express.static('uploads'));

// Logging middleware
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path} - ${req.ip}`);
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// API Routes
app.use('/api/auth', authRoutes);
// app.use('/api/users', userRoutes);
app.use('/api/trainers', trainerRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/calendar', calendarRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/messages', messageRoutes);
// app.use('/api/reviews', reviewRoutes);
// app.use('/api/search', searchRoutes);
app.use('/api/admin', adminRoutes);

// Setup Swagger documentation
// setupSwagger(app);

// Initialize Socket.IO messaging service
socketService.initialize(server);

// Error handling middleware (must be last)
app.use(errorHandler);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: {
      message: `Route ${req.originalUrl} not found`,
      code: 'NOT_FOUND'
    }
  });
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  server.close(() => {
    logger.info('Process terminated');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully');
  server.close(() => {
    logger.info('Process terminated');
    process.exit(0);
  });
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  logger.error('Unhandled Promise Rejection:', err);
  server.close(() => {
    process.exit(1);
  });
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception:', err);
  process.exit(1);
});

server.listen(PORT, () => {
  logger.info(`
🚀 FitProFinder API Server Started
📍 Port: ${PORT}
🌍 Environment: ${process.env.NODE_ENV || 'development'}
📚 API Documentation: http://localhost:${PORT}/api-docs
💾 Database: PostgreSQL
🔗 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:4321'}
  `);
}); 