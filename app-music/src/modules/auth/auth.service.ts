import { Prisma } from '@prisma/client';
import { prisma } from '../../shared/database/client';
import {
  hashPassword,
  comparePassword,
  generateToken,
  verifyToken,
} from '../../shared/utils/crypto';
import {
  AuthenticationError,
  ConflictError,
  NotFoundError,
  ValidationError,
} from '../../shared/errors/AppError';
import { validateEmail, validatePassword } from '../../shared/utils/validation';
import { logger } from '../../shared/utils/logger';
import { UserCredentials, LoginCredentials, AuthResult, TokenValidation } from './auth.types';

export class AuthService {
  /**
   * Register a new user
   */
  async register(credentials: UserCredentials): Promise<AuthResult> {
    const { email, password, userType, profile } = credentials;

    // Validate email format
    if (!validateEmail(email)) {
      throw new ValidationError('Invalid email format');
    }

    // Validate password complexity
    if (!validatePassword(password)) {
      throw new ValidationError(
        'Password must be at least 8 characters and contain uppercase, lowercase, and numbers'
      );
    }

    // Validate display name
    if (!profile.displayName || profile.displayName.trim().length === 0) {
      throw new ValidationError('Display name is required');
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      throw new ConflictError('User with this email already exists');
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Create user with profile in a transaction
    const result = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      // Create user
      const newUser = await tx.user.create({
        data: {
          email: email.toLowerCase(),
          passwordHash,
          userType,
          displayName: profile.displayName.trim(),
          bio: profile.bio?.trim() || null,
          avatarUrl: profile.avatarUrl || null,
        },
      });

      // Create type-specific profile
      let userProfile;
      if (userType === 'creator') {
        userProfile = await tx.creatorProfile.create({
          data: {
            userId: newUser.id,
          },
        });
      } else {
        userProfile = await tx.subscriberProfile.create({
          data: {
            userId: newUser.id,
          },
        });
      }

      return { user: newUser, profile: userProfile };
    });

    logger.info('User registered successfully', {
      userId: result.user.id,
      email: result.user.email,
      userType: result.user.userType,
    });

    // Generate JWT token
    const token = generateToken({
      userId: result.user.id,
      userType: result.user.userType,
      email: result.user.email,
    });

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // Default 7 days

    return {
      token,
      expiresAt,
      user: {
        id: result.user.id,
        email: result.user.email,
        userType: result.user.userType,
        displayName: result.user.displayName,
        bio: result.user.bio,
        avatarUrl: result.user.avatarUrl,
        createdAt: result.user.createdAt,
      },
      profile: {
        ...result.profile,
        userId: result.user.id,
        displayName: result.user.displayName,
        bio: result.user.bio,
        avatarUrl: result.user.avatarUrl,
      },
    };
  }

  /**
   * Login user
   */
  async login(credentials: LoginCredentials): Promise<AuthResult> {
    const { email, password } = credentials;

    // Validate email format
    if (!validateEmail(email)) {
      throw new ValidationError('Invalid email format');
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      throw new AuthenticationError('Invalid email or password');
    }

    // Check if user is active
    if (!user.isActive) {
      throw new AuthenticationError('Account is deactivated');
    }

    // Verify password
    const isPasswordValid = await comparePassword(password, user.passwordHash);

    if (!isPasswordValid) {
      throw new AuthenticationError('Invalid email or password');
    }

    // Get user profile
    let userProfile;
    if (user.userType === 'creator') {
      userProfile = await prisma.creatorProfile.findUnique({
        where: { userId: user.id },
      });
    } else {
      userProfile = await prisma.subscriberProfile.findUnique({
        where: { userId: user.id },
      });
    }

    if (!userProfile) {
      throw new AuthenticationError('User profile not found');
    }

    logger.info('User logged in successfully', {
      userId: user.id,
      email: user.email,
    });

    // Generate JWT token
    const token = generateToken({
      userId: user.id,
      userType: user.userType,
      email: user.email,
    });

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // Default 7 days

    return {
      token,
      expiresAt,
      user: {
        id: user.id,
        email: user.email,
        userType: user.userType,
        displayName: user.displayName,
        bio: user.bio,
        avatarUrl: user.avatarUrl,
        createdAt: user.createdAt,
      },
      profile: {
        ...userProfile,
        userId: user.id,
        displayName: user.displayName,
        bio: user.bio,
        avatarUrl: user.avatarUrl,
      },
    };
  }

  /**
   * Validate JWT token
   */
  async validateToken(token: string): Promise<TokenValidation> {
    try {
      const payload = verifyToken(token);

      // Verify user still exists and is active
      const user = await prisma.user.findUnique({
        where: { id: payload.userId },
      });

      if (!user?.isActive) {
        return { valid: false };
      }

      return {
        valid: true,
        userId: payload.userId,
        userType: payload.userType,
        email: payload.email,
      };
    } catch (error: unknown) {
      logger.warn('Token validation failed', { error });
      return { valid: false };
    }
  }

  /**
   * Change user password
   */
  async changePassword(userId: string, oldPassword: string, newPassword: string): Promise<void> {
    // Validate new password complexity
    if (!validatePassword(newPassword)) {
      throw new ValidationError(
        'New password must be at least 8 characters and contain uppercase, lowercase, and numbers'
      );
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundError('User');
    }

    // Verify old password
    const isOldPasswordValid = await comparePassword(oldPassword, user.passwordHash);

    if (!isOldPasswordValid) {
      throw new AuthenticationError('Current password is incorrect');
    }

    // Hash new password
    const newPasswordHash = await hashPassword(newPassword);

    // Update password
    await prisma.user.update({
      where: { id: userId },
      data: { passwordHash: newPasswordHash },
    });

    logger.info('Password changed successfully', { userId });
  }

  /**
   * Request password reset (placeholder - would send email in production)
   */
  async resetPassword(email: string): Promise<void> {
    // Validate email format
    if (!validateEmail(email)) {
      throw new ValidationError('Invalid email format');
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    // Don't reveal if user exists or not (security best practice)
    if (!user) {
      logger.info('Password reset requested for non-existent email', { email });
      return;
    }

    // In production, generate reset token and send email
    // For now, just log the action
    logger.info('Password reset requested', {
      userId: user.id,
      email: user.email,
    });

    // TODO: Implement email sending with reset token
    // const resetToken = generateSecureToken();
    // Store resetToken in database with expiration
    // Send email with reset link
  }
}

// Export singleton instance
export const authService = new AuthService();
