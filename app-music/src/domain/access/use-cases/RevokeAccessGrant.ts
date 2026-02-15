import { IAccessRepository } from '../repositories/IAccessRepository';
import { ValidationError, NotFoundError, AccessDeniedError } from '../../../shared/errors/AppError';
import { validateUUID } from '../../../shared/utils/validation';
import { logger } from '../../../shared/utils/logger';

/**
 * Revoke access grant input
 */
export interface RevokeAccessGrantInput {
  grantId: string;
  revokedBy: string;
}

/**
 * Revoke Access Grant Use Case
 */
export class RevokeAccessGrant {
  constructor(readonly accessRepository: IAccessRepository) {}

  async execute(input: RevokeAccessGrantInput): Promise<void> {
    const { grantId, revokedBy } = input;

    // Validate IDs
    if (!validateUUID(grantId) || !validateUUID(revokedBy)) {
      throw new ValidationError('Invalid ID format');
    }

    // Find grant
    const grant = await this.accessRepository.findGrantById(grantId);

    if (!grant) {
      throw new NotFoundError('Access grant');
    }

    if (!grant.isActive) {
      throw new ValidationError('Access grant is already inactive');
    }

    // Verify revoker is the creator
    if (grant.creatorId !== revokedBy) {
      throw new AccessDeniedError('Only the creator can revoke access');
    }

    // Revoke grant
    await this.accessRepository.revokeAccessGrant(grantId, revokedBy);

    logger.info('Access grant revoked', {
      grantId,
      subscriberId: grant.subscriberId,
      creatorId: grant.creatorId,
      revokedBy,
    });
  }
}
