import { IUserRepository } from '../repositories/IUserRepository';
import { IPasswordService } from '../repositories/IPasswordService';
import { ITokenService } from '../repositories/ITokenService';
import { ValidationError, AuthenticationError } from '../../../shared/errors/AppError';
import { validateEmail } from '../../../shared/utils/validation';
import { logger } from '../../../shared/utils/logger';

/**
 * Login user input
 */
export interface LoginUserInput {
  email: string;
  password: string;
}

/**
 * Login user output
 */
export interface LoginUserOutput {
  token: string;
  expiresAt: Date;
  user: {
    id: string;
    email: string;
    userType: string;
    displayName: string;
    bio: string | null;
    avatarUrl: string | null;
    createdAt: Date;
  };
  profile: any;
}

/**
 * Login User Use Case
 * Pure business logic - no infrastructure dependencies
 */
export class LoginUser {
  constructor(
    readonly userRepository: IUserRepository,
    readonly passwordService: IPasswordService,
    readonly tokenService: ITokenService
  ) {}

  async execute(input: LoginUserInput): Promise<LoginUserOutput> {
    const { email, password } = input;

    // Validate email format
    if (!validateEmail(email)) {
      throw new ValidationError('Invalid email format');
    }

    // Find user by email
    const user = await this.userRepository.findByEmail(email.toLowerCase());

    if (!user) {
      throw new AuthenticationError('Invalid email or password');
    }

    // Check if user is active
    if (!user.isActive) {
      throw new AuthenticationError('Account is deactivated');
    }

    // Verify password
    const isPasswordValid = await this.passwordService.compare(password, user.passwordHash);

    if (!isPasswordValid) {
      throw new AuthenticationError('Invalid email or password');
    }

    // Get user profile
    const userProfile = await this.userRepository.getProfile(user.id, user.userType);

    if (!userProfile) {
      throw new AuthenticationError('User profile not found');
    }

    logger.info('User logged in successfully', {
      userId: user.id,
      email: user.email,
    });

    // Generate JWT token
    const token = this.tokenService.generate({
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
}
