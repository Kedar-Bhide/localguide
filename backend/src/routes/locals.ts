import { Router } from 'express';
import { LocalController } from '@/controllers/LocalController';
import { authenticateUser } from '@/middleware/auth';
import { rateLimiter } from '@/middleware/rateLimiter';

const router = Router();

// Local expert profile routes
router.post('/profile', authenticateUser, rateLimiter, LocalController.createProfile);
router.put('/profile', authenticateUser, rateLimiter, LocalController.updateProfile);

// Search and discovery routes
router.get('/search', LocalController.search);
router.get('/nearby', LocalController.getNearby);
router.get('/cities', LocalController.getCities);
router.get('/:id', LocalController.getById);

export default router;