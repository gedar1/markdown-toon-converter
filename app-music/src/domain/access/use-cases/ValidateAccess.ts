import { IAccessRepository } from '../repositories/IAccessRepository';
import { ValidationError } from '../../../shared/errors/AppError';
import { validateUUID } from '../../../shared/utils/validation';

/**
 * Validate access input
 */
export interface ValidateAccessInput {
  subscriberId: string;
  creatorId: string;
}

/**
 * Validate access output
 */
export interface ValidateAccessOutput {
  hasAccess: boolean;
  grantId?: string;
  expiresAt?: Date;
  isActive?: boolean;
}

/**
 * Validate Access Use Case
 */
export class ValidateAccess {
  constructor(readonly accessRepository: IAccessRepository) {}

  async execute(input: ValidateAccessInput): Promise<ValidateAccessOutput> {
    const { subscriberId, creatorId } = input;

    // Validate IDs
    if (!validateUUID(subscriberId) || !validateUUID(creatorId)) {
      throw new ValidationError('Invalid ID format');
    }

    // Find active grant
    const grant = await this.accessRepository.findActiveGrant(subscriberId, creatorId);

    if (!grant) {
      return { hasAccess: false };
    }

    // Check if grant has expired
    if (grant.expiresAt && grant.expiresAt < new Date()) {
      // Mark as inactive
      await this.accessRepository.updateGrantStatus(grant.id, false);
      return { hasAccess: false };
    }

    return {
      hasAccess: true,
      grantId: grant.id,
      expiresAt: grant.expiresAt ?? undefined,
      isActive: grant.isActive,
    };
  }
}
