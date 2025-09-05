import { Request, Response } from 'express';
import { ChatService } from '@/services/ChatService';
import { logger } from '@/utils/logger';

export class ChatController {
  /**
   * POST /chats
   * Create or find existing chat
   */
  static async createChat(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: 'Authentication required'
        });
        return;
      }

      const { local_id, city } = req.body;
      
      if (!local_id || !city) {
        res.status(400).json({
          success: false,
          error: 'Local ID and city are required'
        });
        return;
      }

      const result = await ChatService.findOrCreateChat(
        req.user.id, // traveler_id
        local_id,
        city
      );
      
      if (!result.success) {
        res.status(400).json(result);
        return;
      }
      
      res.status(201).json(result);
    } catch (error) {
      logger.error('Create chat controller error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  /**
   * GET /chats
   * Get user's chats
   */
  static async getUserChats(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: 'Authentication required'
        });
        return;
      }

      const result = await ChatService.getUserChats(req.user.id);
      
      if (!result.success) {
        res.status(400).json(result);
        return;
      }
      
      res.status(200).json(result);
    } catch (error) {
      logger.error('Get user chats controller error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  /**
   * GET /chats/:id/messages
   * Get chat messages
   */
  static async getChatMessages(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: 'Authentication required'
        });
        return;
      }

      const { id: chatId } = req.params;
      const page = req.query.page ? parseInt(req.query.page as string) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;

      if (!chatId) {
        res.status(400).json({
          success: false,
          error: 'Chat ID is required'
        });
        return;
      }

      const result = await ChatService.getChatMessages(chatId, req.user.id, page, limit);
      
      if (!result.success) {
        res.status(400).json(result);
        return;
      }
      
      res.status(200).json(result);
    } catch (error) {
      logger.error('Get chat messages controller error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  /**
   * POST /chats/:id/messages
   * Send message
   */
  static async sendMessage(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: 'Authentication required'
        });
        return;
      }

      const { id: chatId } = req.params;
      const { content, message_type = 'text' } = req.body;

      if (!content || content.trim().length === 0) {
        res.status(400).json({
          success: false,
          error: 'Message content is required'
        });
        return;
      }

      if (!chatId) {
        res.status(400).json({
          success: false,
          error: 'Chat ID is required'
        });
        return;
      }

      const result = await ChatService.sendMessage(
        chatId,
        req.user.id,
        content,
        message_type
      );
      
      if (!result.success) {
        res.status(400).json(result);
        return;
      }
      
      res.status(201).json(result);
    } catch (error) {
      logger.error('Send message controller error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  /**
   * PUT /chats/:id/read
   * Mark messages as read
   */
  static async markAsRead(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: 'Authentication required'
        });
        return;
      }

      const { id: chatId } = req.params;
      const { message_ids } = req.body;

      if (!message_ids || !Array.isArray(message_ids)) {
        res.status(400).json({
          success: false,
          error: 'Message IDs array is required'
        });
        return;
      }

      if (!chatId) {
        res.status(400).json({
          success: false,
          error: 'Chat ID is required'
        });
        return;
      }

      const result = await ChatService.markMessagesAsRead(
        chatId,
        req.user.id,
        message_ids
      );
      
      if (!result.success) {
        res.status(400).json(result);
        return;
      }
      
      res.status(200).json(result);
    } catch (error) {
      logger.error('Mark as read controller error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  /**
   * DELETE /chats/:id
   * Archive chat
   */
  static async archiveChat(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: 'Authentication required'
        });
        return;
      }

      const { id: chatId } = req.params;

      if (!chatId) {
        res.status(400).json({
          success: false,
          error: 'Chat ID is required'
        });
        return;
      }

      const result = await ChatService.archiveChat(chatId, req.user.id);
      
      if (!result.success) {
        res.status(400).json(result);
        return;
      }
      
      res.status(200).json(result);
    } catch (error) {
      logger.error('Archive chat controller error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }
}