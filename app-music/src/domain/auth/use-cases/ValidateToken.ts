import { UserType } from '@prisma/client';
import { IUserRepository } from '../repositories/IUserRepository';
import { ITokenService } from '../repositories/ITokenService';
import { logger } from '../../../shared/utils/logger';

/**
 * Token validation output
 */
export interface TokenValidationOutput {
  valid: boolean;
  userId?: string;
  userType?: UserType;
  email?: string;
}

/**
 * Validate Token Use Case
 */
export class ValidateToken {
  constructor(
    readonly userRepository: IUserRepository,
    readonly tokenService: ITokenService
  ) {}

  async execute(token: string): Promise<TokenValidationOutput> {
    try {
      const payload = this.tokenService.verify(token);

      // Verify user still exists and is active
      const user = await this.userRepository.findById(payload.userId);

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
}
