import { Request, Response } from 'express';
import { LocalService } from '@/services/LocalService';
import { logger } from '@/utils/logger';
import { SearchQuery } from '@/types';

export class LocalController {
  /**
   * POST /locals/profile
   * Create local expert profile
   */
  static async createProfile(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: 'Authentication required'
        });
        return;
      }

      const result = await LocalService.createLocalProfile(req.user.id, req.body);
      
      if (!result.success) {
        res.status(400).json(result);
        return;
      }
      
      res.status(201).json(result);
    } catch (error) {
      logger.error('Create local profile controller error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  /**
   * PUT /locals/profile
   * Update local expert profile
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

      const result = await LocalService.updateLocalProfile(req.user.id, req.body);
      
      if (!result.success) {
        res.status(400).json(result);
        return;
      }
      
      res.status(200).json(result);
    } catch (error) {
      logger.error('Update local profile controller error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  /**
   * GET /locals/search
   * Search local experts
   */
  static async search(req: Request, res: Response): Promise<void> {
    try {
      const query: SearchQuery = {
        location: req.query.location as string,
        city: req.query.city as string,
        country: req.query.country as string,
        tags: req.query.tags ? (req.query.tags as string).split(',') : [],
        page: req.query.page ? parseInt(req.query.page as string) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string) : 20
      };

      const result = await LocalService.searchLocalExperts(query);
      
      if (!result.success) {
        res.status(400).json(result);
        return;
      }
      
      res.status(200).json(result);
    } catch (error) {
      logger.error('Search locals controller error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  /**
   * GET /locals/:id
   * Get local expert by ID
   */
  static async getById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      if (!id) {
        res.status(400).json({
          success: false,
          error: 'Local expert ID is required'
        });
        return;
      }

      const result = await LocalService.getLocalExpert(id);
      
      if (!result.success) {
        res.status(404).json(result);
        return;
      }
      
      res.status(200).json(result);
    } catch (error) {
      logger.error('Get local by ID controller error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  /**
   * GET /locals/nearby
   * Get nearby cities with local experts
   */
  static async getNearby(req: Request, res: Response): Promise<void> {
    try {
      const { city, country } = req.query;
      
      if (!city || !country) {
        res.status(400).json({
          success: false,
          error: 'City and country parameters are required'
        });
        return;
      }

      const result = await LocalService.getNearbyLocals(
        city as string,
        country as string
      );
      
      if (!result.success) {
        res.status(400).json(result);
        return;
      }
      
      res.status(200).json(result);
    } catch (error) {
      logger.error('Get nearby locals controller error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  /**
   * GET /locals/cities
   * Get all cities with local experts (for autocomplete)
   */
  static async getCities(req: Request, res: Response): Promise<void> {
    try {
      // Simple implementation - in production you'd want more sophisticated city search
      const { q } = req.query; // search query
      
      const result = {
        success: true,
        data: [
          { city: 'New York', country: 'USA' },
          { city: 'London', country: 'UK' },
          { city: 'Paris', country: 'France' },
          { city: 'Tokyo', country: 'Japan' },
          { city: 'Barcelona', country: 'Spain' }
        ].filter(location => 
          !q || location.city.toLowerCase().includes((q as string).toLowerCase())
        )
      };
      
      res.status(200).json(result);
    } catch (error) {
      logger.error('Get cities controller error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }
}