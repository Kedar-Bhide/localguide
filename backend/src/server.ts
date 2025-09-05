import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import { createServer } from 'http';
import { Server } from 'socket.io';

import { config } from '@/utils/config';
import { logger } from '@/utils/logger';
import { requestLogger } from '@/middleware/requestLogger';
import { errorHandler } from '@/middleware/errorHandler';
import routes from '@/routes';

// Initialize Express app
const app = express();
const server = createServer(app);

// Initialize Socket.IO
const io = new Server(server, {
  cors: {
    origin: config.FRONTEND_URL || "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

// CORS configuration
app.use(cors({
  origin: config.FRONTEND_URL || "http://localhost:3000",
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Compression and parsing middleware
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging
app.use(requestLogger);

// API routes
app.use('/api', routes);

// Socket.IO connection handling
io.on('connection', (socket) => {
  logger.info(`New socket connection: ${socket.id}`);

  // Join user to their personal room for notifications
  socket.on('join', (userId) => {
    socket.join(userId);
    logger.info(`User ${userId} joined their room`);
  });

  // Join chat room
  socket.on('joinChat', (chatId) => {
    socket.join(`chat_${chatId}`);
    logger.info(`Socket ${socket.id} joined chat ${chatId}`);
  });

  // Leave chat room
  socket.on('leaveChat', (chatId) => {
    socket.leave(`chat_${chatId}`);
    logger.info(`Socket ${socket.id} left chat ${chatId}`);
  });

  // Handle new messages
  socket.on('sendMessage', (data) => {
    // Emit to all users in the chat room
    socket.to(`chat_${data.chatId}`).emit('newMessage', data);
    logger.info(`Message sent to chat ${data.chatId}`);
  });

  // Handle typing indicators
  socket.on('typing', (data) => {
    socket.to(`chat_${data.chatId}`).emit('userTyping', {
      userId: data.userId,
      userName: data.userName
    });
  });

  socket.on('stopTyping', (data) => {
    socket.to(`chat_${data.chatId}`).emit('userStoppedTyping', {
      userId: data.userId
    });
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    logger.info(`Socket disconnected: ${socket.id}`);
  });
});

// Error handling middleware (must be last)
app.use(errorHandler);

// 404 handler
app.use('*', (_req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found'
  });
});

// Start server
const PORT = config.PORT;
server.listen(PORT, () => {
  logger.info(`🚀 LocalGuide Backend Server running on port ${PORT}`);
  logger.info(`📱 Environment: ${config.NODE_ENV}`);
  logger.info(`🔒 CORS enabled for: ${config.FRONTEND_URL || "http://localhost:3000"}`);
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

export { app, server, io };