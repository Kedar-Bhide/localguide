import { Router } from 'express';
import { AuthController } from '@/controllers/AuthController';
import { validateSignup, validateLogin, validateProfileUpdate } from '@/middleware/validation';
import { authenticateUser } from '@/middleware/auth';
import { rateLimiter } from '@/middleware/rateLimiter';

const router = Router();

// Auth routes
router.post('/signup', rateLimiter, validateSignup, AuthController.signup);
router.post('/login', rateLimiter, validateLogin, AuthController.login);
router.post('/logout', AuthController.logout);

// Protected profile routes
router.get('/profile', authenticateUser, AuthController.getProfile);
router.put('/profile', authenticateUser, validateProfileUpdate, AuthController.updateProfile);
router.get('/me', authenticateUser, AuthController.me);

export default router;