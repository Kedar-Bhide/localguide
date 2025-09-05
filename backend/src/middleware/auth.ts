import { Request, Response, NextFunction } from 'express';
import { AuthUtils } from '@/utils/auth';
import { supabase } from '@/utils/supabase';
import { logger } from '@/utils/logger';
import { User, UserProfile } from '@/types';

// Extend Request interface to include user data
declare global {
  namespace Express {
    interface Request {
      user?: User;
      profile?: UserProfile;
    }
  }
}

/**
 * Middleware to authenticate user via JWT token
 */
export const authenticateUser = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token = AuthUtils.extractTokenFromHeader(req.headers.authorization);
    
    if (!token) {
      res.status(401).json({
        success: false,
        error: 'Access token required'
      });
      return;
    }
    
    // Verify JWT token
    const decoded = AuthUtils.verifyToken(token);
    
    // Fetch user from database
    const { data: user, error: userError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', decoded.id)
      .single();
    
    if (userError || !user) {
      logger.warn(`Authentication failed for user ID: ${decoded.id}`, { error: userError });
      res.status(401).json({
        success: false,
        error: 'Invalid token or user not found'
      });
      return;
    }
    
    // Attach user to request
    req.user = {
      id: user.id,
      email: user.email,
      full_name: user.full_name,
      created_at: user.created_at,
      updated_at: user.updated_at
    };
    
    req.profile = user;
    
    next();
  } catch (error) {
    logger.error('Authentication middleware error:', error);
    res.status(401).json({
      success: false,
      error: 'Invalid token'
    });
  }
};

/**
 * Middleware to check if user is a local expert
 */
export const requireLocalExpert = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.profile) {
      res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
      return;
    }
    
    if (!req.profile.is_local) {
      res.status(403).json({
        success: false,
        error: 'Local expert access required'
      });
      return;
    }
    
    // Fetch local expert details
    const { data: localExpert, error } = await supabase
      .from('locals')
      .select('*')
      .eq('user_id', req.user!.id)
      .single();
    
    if (error || !localExpert) {
      res.status(403).json({
        success: false,
        error: 'Local expert profile not found'
      });
      return;
    }
    
    next();
  } catch (error) {
    logger.error('Local expert middleware error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

/**
 * Optional authentication middleware (doesn't fail if no token)
 */
export const optionalAuth = async (
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token = AuthUtils.extractTokenFromHeader(req.headers.authorization);
    
    if (token) {
      const decoded = AuthUtils.verifyToken(token);
      
      const { data: user } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', decoded.id)
        .single();
      
      if (user) {
        req.user = {
          id: user.id,
          email: user.email,
          full_name: user.full_name,
          created_at: user.created_at,
          updated_at: user.updated_at
        };
        req.profile = user;
      }
    }
    
    next();
  } catch (error) {
    // Silently continue without authentication
    next();
  }
};