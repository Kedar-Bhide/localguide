import { Request, Response } from 'express';
import { AuthService } from '@/services/AuthService';
import { logger } from '@/utils/logger';
import { LoginRequest, SignupRequest } from '@/types';

export class AuthController {
  /**
   * POST /auth/signup
   * Register a new user
   */
  static async signup(req: Request, res: Response): Promise<void> {
    try {
      const signupData: SignupRequest = req.body;
      const result = await AuthService.signup(signupData);
      
      if (!result.success) {
        res.status(400).json(result);
        return;
      }
      
      res.status(201).json(result);
    } catch (error) {
      logger.error('Signup controller error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  /**
   * POST /auth/login
   * Login user
   */
  static async login(req: Request, res: Response): Promise<void> {
    try {
      const loginData: LoginRequest = req.body;
      const result = await AuthService.login(loginData);
      
      if (!result.success) {
        res.status(401).json(result);
        return;
      }
      
      res.status(200).json(result);
    } catch (error) {
      logger.error('Login controller error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  /**
   * GET /auth/profile
   * Get current user profile
   */
  static async getProfile(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: 'Authentication required'
        });
        return;
      }

      const result = await AuthService.getProfile(req.user.id);
      
      if (!result.success) {
        res.status(404).json(result);
        return;
      }
      
      res.status(200).json(result);
    } catch (error) {
      logger.error('Get profile controller error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  /**
   * PUT /auth/profile
   * Update current user profile
   */
  static async updateProfile(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: 'Authentication required'
        });
        return;
      }

      const result = await AuthService.updateProfile(req.user.id, req.body);
      
      if (!result.success) {
        res.status(400).json(result);
        return;
      }
      
      res.status(200).json(result);
    } catch (error) {
      logger.error('Update profile controller error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  /**
   * POST /auth/logout
   * Logout user (client-side token removal)
   */
  static async logout(_req: Request, res: Response): Promise<void> {
    try {
      // Since we're using stateless JWT tokens, logout is handled client-side
      // This endpoint exists for consistency and future token blacklisting if needed
      
      res.status(200).json({
        success: true,
        message: 'Logged out successfully'
      });
    } catch (error) {
      logger.error('Logout controller error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  /**
   * GET /auth/me
   * Get current user info (minimal)
   */
  static async me(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user || !req.profile) {
        res.status(401).json({
          success: false,
          error: 'Authentication required'
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: {
          user: req.user,
          profile: req.profile
        }
      });
    } catch (error) {
      logger.error('Me controller error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }
}