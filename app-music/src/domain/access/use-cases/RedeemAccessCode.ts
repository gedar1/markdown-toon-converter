import { IAccessRepository } from '../repositories/IAccessRepository';
import { ValidationError, NotFoundError, ConflictError } from '../../../shared/errors/AppError';
import { validateUUID } from '../../../shared/utils/validation';
import { logger } from '../../../shared/utils/logger';

/**
 * Redeem access code input
 */
export interface RedeemAccessCodeInput {
  code: string;
  subscriberId: string;
}

/**
 * Redeem access code output
 */
export interface RedeemAccessCodeOutput {
  success: boolean;
  accessGrantId: string;
  creatorId: string;
  expiresAt: Date | null;
}

/**
 * Redeem Access Code Use Case
 */
export class RedeemAccessCode {
  constructor(readonly accessRepository: IAccessRepository) {}

  async execute(input: RedeemAccessCodeInput): Promise<RedeemAccessCodeOutput> {
    const { code, subscriberId } = input;

    // Validate subscriber ID
    if (!validateUUID(subscriberId)) {
      throw new ValidationError('Invalid subscriber ID format');
    }

    // Find access code
    const accessCode = await this.accessRepository.findAccessCodeByCode(code.toUpperCase());

    if (!accessCode) {
      throw new NotFoundError('Access code');
    }

    // Validate code
    if (!accessCode.isValid) {
      throw new ValidationError('Access code is invalid');
    }

    if (accessCode.isRedeemed) {
      throw new ConflictError('Access code has already been redeemed');
    }

    if (accessCode.expiresAt && accessCode.expiresAt < new Date()) {
      throw new ValidationError('Access code has expired');
    }

    // Check if subscriber already has active access to this creator
    const existingGrant = await this.accessRepository.findActiveGrant(
      subscriberId,
      accessCode.creatorId
    );

    if (existingGrant) {
      throw new ConflictError('You already have active access to this creator');
    }

    // Calculate grant expiration
    const grantExpiresAt = new Date();
    grantExpiresAt.setDate(grantExpiresAt.getDate() + accessCode.durationDays);

    // Mark code as redeemed
    await this.accessRepository.updateAccessCode(code.toUpperCase(), {
      isRedeemed: true,
      redeemedBy: subscriberId,
      redeemedAt: new Date(),
    });

    // Create access grant
    const grant = await this.accessRepository.createAccessGrant({
      subscriberId,
      creatorId: accessCode.creatorId,
      accessCode: code.toUpperCase(),
      expiresAt: grantExpiresAt,
    });

    logger.info('Access code redeemed', {
      code,
      subscriberId,
      creatorId: accessCode.creatorId,
      grantId: grant.id,
    });

    return {
      success: true,
      accessGrantId: grant.id,
      creatorId: accessCode.creatorId,
      expiresAt: grant.expiresAt,
    };
  }
}
