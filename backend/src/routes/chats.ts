import { Router } from 'express';
import { ChatController } from '@/controllers/ChatController';
import { authenticateUser } from '@/middleware/auth';
import { rateLimiter } from '@/middleware/rateLimiter';

const router = Router();

// All chat routes require authentication
router.use(authenticateUser);

// Chat management routes
router.post('/', rateLimiter, ChatController.createChat);
router.get('/', ChatController.getUserChats);
router.delete('/:id', ChatController.archiveChat);

// Message routes
router.get('/:id/messages', ChatController.getChatMessages);
router.post('/:id/messages', rateLimiter, ChatController.sendMessage);
router.put('/:id/read', ChatController.markAsRead);

export default router;