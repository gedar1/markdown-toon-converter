import { UserType } from '@prisma/client';
import { IUserRepository } from '../repositories/IUserRepository';
import { IPasswordService } from '../repositories/IPasswordService';
import { ITokenService } from '../repositories/ITokenService';
import { ValidationError, ConflictError } from '../../../shared/errors/AppError';
import { validateEmail } from '../../../shared/utils/validation';
import { logger } from '../../../shared/utils/logger';

/**
 * Register user input
 */
export interface RegisterUserInput {
  email: string;
  password: string;
  userType: UserType;
  profile: {
    displayName: string;
    bio?: string;
    avatarUrl?: string;
  };
}

/**
 * Register user output
 */
export interface RegisterUserOutput {
  token: string;
  expiresAt: Date;
  user: {
    id: string;
    email: string;
    userType: UserType;
    displayName: string;
    bio: string | null;
    avatarUrl: string | null;
    createdAt: Date;
  };
  profile: any;
}

/**
 * Register User Use Case
 * Pure business logic - no infrastructure dependencies
 */
export class RegisterUser {
  constructor(
    readonly userRepository: IUserRepository,
    readonly passwordService: IPasswordService,
    readonly tokenService: ITokenService
  ) {}

  async execute(input: RegisterUserInput): Promise<RegisterUserOutput> {
    const { email, password, userType, profile } = input;

    // Validate email format
    if (!validateEmail(email)) {
      throw new ValidationError('Invalid email format');
    }

    // Validate password complexity
    if (!this.passwordService.validate(password)) {
      throw new ValidationError(
        'Password must be at least 8 characters and contain uppercase, lowercase, and numbers'
      );
    }

    // Validate display name
    if (!profile.displayName || profile.displayName.trim().length === 0) {
      throw new ValidationError('Display name is required');
    }

    // Check if user already exists
    const existingUser = await this.userRepository.findByEmail(email.toLowerCase());

    if (existingUser) {
      throw new ConflictError('User with this email already exists');
    }

    // Hash password
    const passwordHash = await this.passwordService.hash(password);

    // Create user with profile
    const result = await this.userRepository.create({
      email: email.toLowerCase(),
      passwordHash,
      userType,
      displayName: profile.displayName.trim(),
      bio: profile.bio?.trim(),
      avatarUrl: profile.avatarUrl,
    });

    logger.info('User registered successfully', {
      userId: result.user.id,
      email: result.user.email,
      userType: result.user.userType,
    });

    // Generate JWT token
    const token = this.tokenService.generate({
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
}
