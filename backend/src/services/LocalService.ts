import { supabase } from '@/utils/supabase';
import { ValidationUtils } from '@/utils/validation';
import { logger } from '@/utils/logger';
import {
  LocalExpert,
  SearchQuery,
  SearchResult,
  ApiResponse
} from '@/types';

export class LocalService {
  /**
   * Create local expert profile
   */
  static async createLocalProfile(
    userId: string,
    data: Omit<LocalExpert, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'is_verified' | 'rating' | 'total_connections'>
  ): Promise<ApiResponse<LocalExpert>> {
    try {
      // Validate input
      if (!ValidationUtils.isValidCity(data.city)) {
        return {
          success: false,
          error: 'Invalid city name'
        };
      }

      if (!ValidationUtils.isValidCountry(data.country)) {
        return {
          success: false,
          error: 'Invalid country name'
        };
      }

      if (data.bio.length < 50 || data.bio.length > 1000) {
        return {
          success: false,
          error: 'Bio must be between 50 and 1000 characters'
        };
      }

      if (!ValidationUtils.validateTags(data.tags)) {
        return {
          success: false,
          error: 'Invalid tags format'
        };
      }

      // Check if user already has a local profile
      const { data: existing } = await supabase
        .from('locals')
        .select('id')
        .eq('user_id', userId)
        .single();

      if (existing) {
        return {
          success: false,
          error: 'Local expert profile already exists'
        };
      }

      // Create local expert profile
      const localData = {
        user_id: userId,
        city: ValidationUtils.sanitizeString(data.city),
        country: ValidationUtils.sanitizeString(data.country),
        bio: ValidationUtils.sanitizeString(data.bio),
        tags: data.tags,
        languages: data.languages || ['English'],
        is_verified: false,
        rating: 0,
        total_connections: 0
      };

      const { data: localExpert, error: localError } = await supabase
        .from('locals')
        .insert([localData])
        .select()
        .single();

      if (localError) {
        logger.error('Local profile creation error:', localError);
        return {
          success: false,
          error: 'Failed to create local expert profile'
        };
      }

      // Update user profile to mark as local
      await supabase
        .from('profiles')
        .update({ 
          is_local: true,
          city: localData.city,
          country: localData.country,
          bio: localData.bio,
          tags: localData.tags
        })
        .eq('id', userId);

      logger.info(`Local expert profile created for user: ${userId}`, {
        city: localData.city,
        country: localData.country
      });

      return {
        success: true,
        data: localExpert
      };

    } catch (error) {
      logger.error('Create local profile service error:', error);
      return {
        success: false,
        error: 'Internal server error'
      };
    }
  }

  /**
   * Update local expert profile
   */
  static async updateLocalProfile(
    userId: string,
    updates: Partial<LocalExpert>
  ): Promise<ApiResponse<LocalExpert>> {
    try {
      const sanitizedUpdates: any = {
        updated_at: new Date().toISOString()
      };

      if (updates.city) {
        if (!ValidationUtils.isValidCity(updates.city)) {
          return {
            success: false,
            error: 'Invalid city name'
          };
        }
        sanitizedUpdates.city = ValidationUtils.sanitizeString(updates.city);
      }

      if (updates.country) {
        if (!ValidationUtils.isValidCountry(updates.country)) {
          return {
            success: false,
            error: 'Invalid country name'
          };
        }
        sanitizedUpdates.country = ValidationUtils.sanitizeString(updates.country);
      }

      if (updates.bio) {
        if (updates.bio.length < 50 || updates.bio.length > 1000) {
          return {
            success: false,
            error: 'Bio must be between 50 and 1000 characters'
          };
        }
        sanitizedUpdates.bio = ValidationUtils.sanitizeString(updates.bio);
      }

      if (updates.tags) {
        if (!ValidationUtils.validateTags(updates.tags)) {
          return {
            success: false,
            error: 'Invalid tags format'
          };
        }
        sanitizedUpdates.tags = updates.tags;
      }

      if (updates.languages) {
        sanitizedUpdates.languages = updates.languages;
      }

      // Update local profile
      const { data: localExpert, error } = await supabase
        .from('locals')
        .update(sanitizedUpdates)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) {
        logger.error('Local profile update error:', error);
        return {
          success: false,
          error: 'Failed to update local expert profile'
        };
      }

      // Update corresponding user profile
      const profileUpdates: any = {};
      if (sanitizedUpdates.city) profileUpdates.city = sanitizedUpdates.city;
      if (sanitizedUpdates.country) profileUpdates.country = sanitizedUpdates.country;
      if (sanitizedUpdates.bio) profileUpdates.bio = sanitizedUpdates.bio;
      if (sanitizedUpdates.tags) profileUpdates.tags = sanitizedUpdates.tags;

      if (Object.keys(profileUpdates).length > 0) {
        await supabase
          .from('profiles')
          .update(profileUpdates)
          .eq('id', userId);
      }

      logger.info(`Local expert profile updated for user: ${userId}`);

      return {
        success: true,
        data: localExpert
      };

    } catch (error) {
      logger.error('Update local profile service error:', error);
      return {
        success: false,
        error: 'Internal server error'
      };
    }
  }

  /**
   * Search local experts
   */
  static async searchLocalExperts(query: SearchQuery): Promise<ApiResponse<SearchResult[]>> {
    try {
      const { page = 1, limit = 20 } = ValidationUtils.validatePagination(query.page, query.limit);
      const offset = (page - 1) * limit;

      // Build search query
      let searchQuery = supabase
        .from('locals')
        .select(`
          id,
          user_id,
          city,
          country,
          bio,
          tags,
          rating,
          total_connections,
          profiles!locals_user_id_fkey (
            full_name,
            avatar_url,
            last_active_at
          )
        `)
        .eq('is_verified', true)
        .order('rating', { ascending: false })
        .order('total_connections', { ascending: false });

      // Apply location filters
      if (query.city) {
        searchQuery = searchQuery.ilike('city', `%${query.city}%`);
      }

      if (query.country) {
        searchQuery = searchQuery.ilike('country', `%${query.country}%`);
      }

      // Apply tag filters
      if (query.tags && query.tags.length > 0) {
        searchQuery = searchQuery.overlaps('tags', query.tags);
      }

      // Execute search with pagination
      const { data: locals, error, count } = await searchQuery
        .range(offset, offset + limit - 1)
        .limit(limit);

      if (error) {
        logger.error('Local experts search error:', error);
        return {
          success: false,
          error: 'Failed to search local experts'
        };
      }

      // Transform results
      const results: SearchResult[] = locals?.map(local => ({
        id: local.id,
        user_id: local.user_id,
        city: local.city,
        country: local.country,
        bio: local.bio,
        tags: local.tags,
        rating: local.rating,
        total_connections: local.total_connections,
        user: {
          full_name: (local.profiles as any)?.full_name || '',
          avatar_url: (local.profiles as any)?.avatar_url,
          last_active_at: (local.profiles as any)?.last_active_at || ''
        }
      })) || [];

      return {
        success: true,
        data: results,
        pagination: {
          page,
          limit,
          total: count || 0,
          pages: Math.ceil((count || 0) / limit)
        }
      };

    } catch (error) {
      logger.error('Search local experts service error:', error);
      return {
        success: false,
        error: 'Internal server error'
      };
    }
  }

  /**
   * Get local expert by ID
   */
  static async getLocalExpert(localId: string): Promise<ApiResponse<SearchResult>> {
    try {
      const { data: local, error } = await supabase
        .from('locals')
        .select(`
          id,
          user_id,
          city,
          country,
          bio,
          tags,
          rating,
          total_connections,
          languages,
          profiles!locals_user_id_fkey (
            full_name,
            avatar_url,
            last_active_at
          )
        `)
        .eq('id', localId)
        .single();

      if (error || !local) {
        return {
          success: false,
          error: 'Local expert not found'
        };
      }

      const result: SearchResult = {
        id: local.id,
        user_id: local.user_id,
        city: local.city,
        country: local.country,
        bio: local.bio,
        tags: local.tags,
        rating: local.rating,
        total_connections: local.total_connections,
        user: {
          full_name: (local.profiles as any)?.full_name || '',
          avatar_url: (local.profiles as any)?.avatar_url,
          last_active_at: (local.profiles as any)?.last_active_at || ''
        }
      };

      return {
        success: true,
        data: result
      };

    } catch (error) {
      logger.error('Get local expert service error:', error);
      return {
        success: false,
        error: 'Internal server error'
      };
    }
  }

  /**
   * Get nearby cities with local experts
   */
  static async getNearbyLocals(city: string, country: string): Promise<ApiResponse<any[]>> {
    try {
      // This is a simplified version - in production you'd use geographical queries
      const { data: nearbyCities, error } = await supabase
        .from('locals')
        .select('city, country')
        .neq('city', city)
        .eq('country', country)
        .eq('is_verified', true);

      if (error) {
        logger.error('Nearby locals search error:', error);
        return {
          success: false,
          error: 'Failed to find nearby locals'
        };
      }

      // Group by city and count locals
      const cityGroups = nearbyCities?.reduce((acc: any, local) => {
        const key = `${local.city}, ${local.country}`;
        if (!acc[key]) {
          acc[key] = {
            city: local.city,
            country: local.country,
            locals_count: 0
          };
        }
        acc[key].locals_count++;
        return acc;
      }, {});

      const results = Object.values(cityGroups || {}).slice(0, 5);

      return {
        success: true,
        data: results
      };

    } catch (error) {
      logger.error('Get nearby locals service error:', error);
      return {
        success: false,
        error: 'Internal server error'
      };
    }
  }
}