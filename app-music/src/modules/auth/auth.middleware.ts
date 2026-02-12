import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../../shared/utils/crypto';
import { AuthenticationError, AccessDeniedError } from '../../shared/errors/AppError';
import { logger } from '../../shared/utils/logger';

/**
 * User type enum
 */
type UserType = 'creator' | 'subscriber';

/**
 * Extended Express Request with authenticated user data
 */
export interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    userType: UserType;
    email: string;
  };
}

/**
 * Middleware to authenticate JWT token
 * Validates the token and attaches user data to request
 */
export function authenticate(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      throw new AuthenticationError('No authorization header provided');
    }

    // Check if it's a Bearer token
    if (!authHeader.startsWith('Bearer ')) {
      throw new AuthenticationError(
        'Invalid authorization header format. Expected: Bearer <token>'
      );
    }

    // Extract token
    const token = authHeader.substring(7);

    if (!token) {
      throw new AuthenticationError('No token provided');
    }

    // Verify token
    const payload = verifyToken(token);

    // Attach user data to request
    req.user = {
      userId: payload.userId,
      userType: payload.userType,
      email: payload.email,
    };

    logger.debug('User authenticated', {
      userId: payload.userId,
      userType: payload.userType,
    });

    next();
  } catch (error) {
    if (error instanceof AuthenticationError) {
      next(error);
    } else {
      next(new AuthenticationError('Token verification failed'));
    }
  }
}

/**
 * Middleware to authorize based on user type
 * Must be used after authenticate middleware
 */
export function authorizeUserType(...allowedTypes: UserType[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    try {
      // Check if user is authenticated
      if (!req.user) {
        throw new AuthenticationError('User not authenticated');
      }

      // Check if user type is allowed
      if (!allowedTypes.includes(req.user.userType)) {
        throw new AccessDeniedError(
          `Access denied. Required user type: ${allowedTypes.join(' or ')}`
        );
      }

      logger.debug('User authorized', {
        userId: req.user.userId,
        userType: req.user.userType,
        allowedTypes,
      });

      next();
    } catch (error) {
      next(error);
    }
  };
}

/**
 * Middleware to authorize creator access
 * Shorthand for authorizeUserType('creator')
 */
export const authorizeCreator = authorizeUserType('creator');

/**
 * Middleware to authorize subscriber access
 * Shorthand for authorizeUserType('subscriber')
 */
export const authorizeSubscriber = authorizeUserType('subscriber');

/**
 * Optional authentication middleware
 * Attaches user data if token is present, but doesn't fail if missing
 */
export function optionalAuthenticate(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith('Bearer ')) {
      // No token provided, continue without authentication
      next();
      return;
    }

    const token = authHeader.substring(7);

    if (!token) {
      next();
      return;
    }

    // Try to verify token
    const payload = verifyToken(token);

    req.user = {
      userId: payload.userId,
      userType: payload.userType,
      email: payload.email,
    };

    next();
  } catch (error) {
    // Token is invalid, but we don't fail - just continue without user
    logger.warn('Optional authentication failed', { error });
    next();
  }
}
