import { IUserRepository } from '../repositories/IUserRepository';
import { IPasswordService } from '../repositories/IPasswordService';
import {
  ValidationError,
  AuthenticationError,
  NotFoundError,
} from '../../../shared/errors/AppError';
import { logger } from '../../../shared/utils/logger';

/**
 * Change password input
 */
export interface ChangePasswordInput {
  userId: string;
  oldPassword: string;
  newPassword: string;
}

/**
 * Change Password Use Case
 */
export class ChangePassword {
  constructor(
    readonly userRepository: IUserRepository,
    readonly passwordService: IPasswordService
  ) {}

  async execute(input: ChangePasswordInput): Promise<void> {
    const { userId, oldPassword, newPassword } = input;

    // Validate new password complexity
    if (!this.passwordService.validate(newPassword)) {
      throw new ValidationError(
        'New password must be at least 8 characters and contain uppercase, lowercase, and numbers'
      );
    }

    // Find user
    const user = await this.userRepository.findById(userId);

    if (!user) {
      throw new NotFoundError('User');
    }

    // Verify old password
    const isOldPasswordValid = await this.passwordService.compare(oldPassword, user.passwordHash);

    if (!isOldPasswordValid) {
      throw new AuthenticationError('Current password is incorrect');
    }

    // Hash new password
    const newPasswordHash = await this.passwordService.hash(newPassword);

    // Update password
    await this.userRepository.updatePassword(userId, newPasswordHash);

    logger.info('Password changed successfully', { userId });
  }
}
