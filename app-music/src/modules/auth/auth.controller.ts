import { Response } from 'express';
import { authService } from './auth.service';
import { AuthenticatedRequest } from './auth.middleware';
import { validateSchema, commonSchemas } from '../../shared/utils/validation';
import { logger } from '../../shared/utils/logger';
import { z } from 'zod';
import { UserType } from '@prisma/client';

/**
 * Validation schemas for authentication endpoints
 */
const registerSchema = z.object({
  email: commonSchemas.email,
  password: commonSchemas.password,
  userType: z.enum(['creator', 'subscriber']),
  profile: z.object({
    displayName: commonSchemas.displayName,
    bio: commonSchemas.bio,
    avatarUrl: commonSchemas.url,
  }),
});

const loginSchema = z.object({
  email: commonSchemas.email,
  password: z.string().min(1, 'Password is required'),
});

const changePasswordSchema = z.object({
  oldPassword: z.string().min(1, 'Current password is required'),
  newPassword: commonSchemas.password,
});

const resetPasswordSchema = z.object({
  email: commonSchemas.email,
});

/**
 * Authentication Controller
 * Handles HTTP requests for authentication operations
 */
export class AuthController {
  /**
   * Register a new user
   * POST /auth/register
   */
  async register(req: AuthenticatedRequest, res: Response): Promise<void> {
    const data = validateSchema(registerSchema, req.body);

    const result = await authService.register({
      email: data.email,
      password: data.password,
      userType: data.userType as UserType,
      profile: {
        displayName: data.profile.displayName,
        bio: data.profile.bio,
        avatarUrl: data.profile.avatarUrl,
      },
    });

    logger.info('User registered via API', {
      userId: result.user.id,
      email: result.user.email,
    });

    res.status(201).json({
      status: 'success',
      data: result,
      message: 'User registered successfully',
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Login user
   * POST /auth/login
   */
  async login(req: AuthenticatedRequest, res: Response): Promise<void> {
    const data = validateSchema(loginSchema, req.body);

    const result = await authService.login({
      email: data.email,
      password: data.password,
    });

    logger.info('User logged in via API', {
      userId: result.userId,
    });

    res.status(200).json({
      status: 'success',
      data: result,
      message: 'Login successful',
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Get current user profile
   * GET /auth/me
   * Requires authentication
   */
  async getCurrentUser(req: AuthenticatedRequest, res: Response): Promise<void> {
    if (!req.user) {
      res.status(401).json({
        status: 'error',
        code: 'AUTHENTICATION_ERROR',
        message: 'User not authenticated',
        timestamp: new Date().toISOString(),
      });
      return;
    }

    res.status(200).json({
      status: 'success',
      data: {
        userId: req.user.userId,
        userType: req.user.userType,
        email: req.user.email,
      },
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Validate token
   * GET /auth/validate
   * Requires authentication
   */
  async validateToken(req: AuthenticatedRequest, res: Response): Promise<void> {
    if (!req.user) {
      res.status(401).json({
        status: 'error',
        code: 'AUTHENTICATION_ERROR',
        message: 'Invalid or expired token',
        timestamp: new Date().toISOString(),
      });
      return;
    }

    res.status(200).json({
      status: 'success',
      data: {
        valid: true,
        userId: req.user.userId,
        userType: req.user.userType,
        email: req.user.email,
      },
      message: 'Token is valid',
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Change password
   * POST /auth/change-password
   * Requires authentication
   */
  async changePassword(req: AuthenticatedRequest, res: Response): Promise<void> {
    if (!req.user) {
      res.status(401).json({
        status: 'error',
        code: 'AUTHENTICATION_ERROR',
        message: 'User not authenticated',
        timestamp: new Date().toISOString(),
      });
      return;
    }

    const data = validateSchema(changePasswordSchema, req.body);

    await authService.changePassword(req.user.userId, data.oldPassword, data.newPassword);

    logger.info('Password changed via API', {
      userId: req.user.userId,
    });

    res.status(200).json({
      status: 'success',
      message: 'Password changed successfully',
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Request password reset
   * POST /auth/reset-password
   */
  async resetPassword(req: AuthenticatedRequest, res: Response): Promise<void> {
    const data = validateSchema(resetPasswordSchema, req.body);

    await authService.resetPassword(data.email);

    logger.info('Password reset requested via API', {
      email: data.email,
    });

    // Always return success to prevent email enumeration
    res.status(200).json({
      status: 'success',
      message: 'If the email exists, a password reset link has been sent',
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Logout user
   * POST /auth/logout
   * Note: JWT tokens are stateless, so logout is handled client-side
   * This endpoint is provided for consistency and logging purposes
   */
  async logout(req: AuthenticatedRequest, res: Response): Promise<void> {
    if (req.user) {
      logger.info('User logged out via API', {
        userId: req.user.userId,
      });
    }

    res.status(200).json({
      status: 'success',
      message: 'Logout successful. Please remove the token from client storage.',
      timestamp: new Date().toISOString(),
    });
  }
}

// Export singleton instance
export const authController = new AuthController();
