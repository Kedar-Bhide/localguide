import { supabase, supabaseAuth } from '@/utils/supabase';
import { AuthUtils } from '@/utils/auth';
import { ValidationUtils } from '@/utils/validation';
import { logger } from '@/utils/logger';
import {
  User,
  UserProfile,
  LoginRequest,
  SignupRequest,
  AuthResponse,
  ApiResponse
} from '@/types';

export class AuthService {
  /**
   * Register a new user
   */
  static async signup(data: SignupRequest): Promise<ApiResponse<AuthResponse>> {
    try {
      // Validate input
      if (!ValidationUtils.isValidEmail(data.email)) {
        return {
          success: false,
          error: 'Invalid email address'
        };
      }

      if (!ValidationUtils.isValidName(data.full_name)) {
        return {
          success: false,
          error: 'Full name must be between 2 and 100 characters'
        };
      }

      const passwordValidation = ValidationUtils.validatePassword(data.password);
      if (!passwordValidation.isValid) {
        return {
          success: false,
          error: passwordValidation.errors.join(', ')
        };
      }

      // Check if user already exists
      const { data: existingUser } = await supabase
        .from('profiles')
        .select('email')
        .eq('email', data.email)
        .single();

      if (existingUser) {
        return {
          success: false,
          error: 'User with this email already exists'
        };
      }

      // Create user in Supabase Auth
      const { data: authUser, error: authError } = await supabaseAuth.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            full_name: data.full_name
          }
        }
      });

      if (authError || !authUser.user) {
        logger.error('Supabase auth signup error:', authError);
        return {
          success: false,
          error: authError?.message || 'Failed to create user account'
        };
      }

      // Create user profile
      const profileData = {
        id: authUser.user.id,
        email: data.email,
        full_name: ValidationUtils.sanitizeString(data.full_name),
        is_local: false,
        last_active_at: new Date().toISOString()
      };

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .insert([profileData])
        .select()
        .single();

      if (profileError) {
        logger.error('Profile creation error:', profileError);
        // Clean up auth user if profile creation fails
        await supabaseAuth.auth.admin.deleteUser(authUser.user.id);
        return {
          success: false,
          error: 'Failed to create user profile'
        };
      }

      // Generate JWT token
      const user: User = {
        id: authUser.user.id,
        email: data.email,
        full_name: data.full_name,
        created_at: authUser.user.created_at,
        updated_at: new Date().toISOString()
      };

      const token = AuthUtils.generateToken(user);

      logger.info(`User registered successfully: ${user.email}`, { userId: user.id });

      return {
        success: true,
        data: {
          user,
          profile,
          token,
          expires_in: 7 * 24 * 60 * 60 // 7 days in seconds
        }
      };

    } catch (error) {
      logger.error('Signup service error:', error);
      return {
        success: false,
        error: 'Internal server error'
      };
    }
  }

  /**
   * Login user
   */
  static async login(data: LoginRequest): Promise<ApiResponse<AuthResponse>> {
    try {
      // Validate input
      if (!ValidationUtils.isValidEmail(data.email)) {
        return {
          success: false,
          error: 'Invalid email address'
        };
      }

      if (!data.password) {
        return {
          success: false,
          error: 'Password is required'
        };
      }

      // Authenticate with Supabase
      const { data: authData, error: authError } = await supabaseAuth.auth.signInWithPassword({
        email: data.email,
        password: data.password
      });

      if (authError || !authData.user) {
        logger.warn(`Login attempt failed for email: ${data.email}`, { error: authError?.message });
        return {
          success: false,
          error: 'Invalid email or password'
        };
      }

      // Fetch user profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authData.user.id)
        .single();

      if (profileError || !profile) {
        logger.error('Profile fetch error during login:', profileError);
        return {
          success: false,
          error: 'User profile not found'
        };
      }

      // Update last active timestamp
      await supabase
        .from('profiles')
        .update({ last_active_at: new Date().toISOString() })
        .eq('id', authData.user.id);

      const user: User = {
        id: authData.user.id,
        email: authData.user.email!,
        full_name: profile.full_name,
        created_at: authData.user.created_at!,
        updated_at: new Date().toISOString()
      };

      const token = AuthUtils.generateToken(user);

      logger.info(`User logged in successfully: ${user.email}`, { userId: user.id });

      return {
        success: true,
        data: {
          user,
          profile,
          token,
          expires_in: 7 * 24 * 60 * 60 // 7 days in seconds
        }
      };

    } catch (error) {
      logger.error('Login service error:', error);
      return {
        success: false,
        error: 'Internal server error'
      };
    }
  }

  /**
   * Get user profile by ID
   */
  static async getProfile(userId: string): Promise<ApiResponse<UserProfile>> {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error || !profile) {
        return {
          success: false,
          error: 'Profile not found'
        };
      }

      return {
        success: true,
        data: profile
      };

    } catch (error) {
      logger.error('Get profile service error:', error);
      return {
        success: false,
        error: 'Internal server error'
      };
    }
  }

  /**
   * Update user profile
   */
  static async updateProfile(
    userId: string, 
    updates: Partial<UserProfile>
  ): Promise<ApiResponse<UserProfile>> {
    try {
      // Sanitize inputs
      const sanitizedUpdates: any = {
        updated_at: new Date().toISOString()
      };

      if (updates.full_name) {
        if (!ValidationUtils.isValidName(updates.full_name)) {
          return {
            success: false,
            error: 'Invalid full name'
          };
        }
        sanitizedUpdates.full_name = ValidationUtils.sanitizeString(updates.full_name);
      }

      if (updates.bio) {
        sanitizedUpdates.bio = ValidationUtils.sanitizeString(updates.bio);
      }

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

      if (updates.tags) {
        if (!ValidationUtils.validateTags(updates.tags)) {
          return {
            success: false,
            error: 'Invalid tags format'
          };
        }
        sanitizedUpdates.tags = updates.tags;
      }

      // Update profile
      const { data: profile, error } = await supabase
        .from('profiles')
        .update(sanitizedUpdates)
        .eq('id', userId)
        .select()
        .single();

      if (error) {
        logger.error('Profile update error:', error);
        return {
          success: false,
          error: 'Failed to update profile'
        };
      }

      logger.info(`Profile updated for user: ${userId}`);

      return {
        success: true,
        data: profile
      };

    } catch (error) {
      logger.error('Update profile service error:', error);
      return {
        success: false,
        error: 'Internal server error'
      };
    }
  }
}