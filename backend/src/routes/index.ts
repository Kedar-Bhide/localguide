import { Router } from 'express';
import authRoutes from './auth';
import localRoutes from './locals';
import chatRoutes from './chats';

const router = Router();

// Health check endpoint
router.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0'
  });
});

// API routes
router.use('/auth', authRoutes);
router.use('/locals', localRoutes);
router.use('/chats', chatRoutes);

export default router;