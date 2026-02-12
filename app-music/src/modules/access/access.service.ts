import { Prisma } from '@prisma/client';
import { prisma } from '../../shared/database/client';
import { generateUniqueAccessCode } from '../../shared/utils/crypto';
import {
  ValidationError,
  NotFoundError,
  ConflictError,
  AccessDeniedError,
} from '../../shared/errors/AppError';
import { validateUUID } from '../../shared/utils/validation';
import { logger } from '../../shared/utils/logger';
import {
  GenerateAccessCodeRequest,
  AccessCodeData,
  RedeemAccessCodeRequest,
  RedeemAccessCodeResult,
  ValidateAccessRequest,
  ValidateAccessResult,
  PaymentWebhookPayload,
  InvalidateAccessCodeRequest,
} from './access.types';

export class AccessService {
  /**
   * Generate a unique access code after successful payment
   */
  async generateAccessCode(request: GenerateAccessCodeRequest): Promise<AccessCodeData> {
    const { creatorId, paymentId, amount, currency, durationDays } = request;

    // Validate creator exists
    if (!validateUUID(creatorId)) {
      throw new ValidationError('Invalid creator ID format');
    }

    const creator = await prisma.user.findUnique({
      where: { id: creatorId, userType: 'creator' },
    });

    if (!creator) {
      throw new NotFoundError('Creator');
    }

    // Check if payment ID already has a code (idempotency)
    const existingCode = await prisma.accessCode.findUnique({
      where: { paymentId },
    });

    if (existingCode) {
      logger.info('Access code already exists for payment', { paymentId });
      return this.mapAccessCodeToData(existingCode);
    }

    // Generate unique code
    const code = await generateUniqueAccessCode(async (c) => {
      const existing = await prisma.accessCode.findUnique({ where: { code: c } });
      return !!existing;
    });

    // Calculate expiration (null = no expiration)
    const expiresAt = null; // Code doesn't expire, but access grant does

    // Create access code
    const accessCode = await prisma.accessCode.create({
      data: {
        code,
        creatorId,
        paymentId,
        amount,
        currency,
        durationDays,
        expiresAt,
        isRedeemed: false,
        isValid: true,
      },
    });

    logger.info('Access code generated', {
      code,
      creatorId,
      paymentId,
      durationDays,
    });

    return this.mapAccessCodeToData(accessCode);
  }

  /**
   * Redeem an access code
   */
  async redeemAccessCode(request: RedeemAccessCodeRequest): Promise<RedeemAccessCodeResult> {
    const { code, subscriberId } = request;

    // Validate subscriber
    if (!validateUUID(subscriberId)) {
      throw new ValidationError('Invalid subscriber ID format');
    }

    const subscriber = await prisma.user.findUnique({
      where: { id: subscriberId, userType: 'subscriber' },
    });

    if (!subscriber) {
      throw new NotFoundError('Subscriber');
    }

    // Find access code
    const accessCode = await prisma.accessCode.findUnique({
      where: { code: code.toUpperCase() },
    });

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
    const existingGrant = await prisma.accessGrant.findFirst({
      where: {
        subscriberId,
        creatorId: accessCode.creatorId,
        isActive: true,
      },
    });

    if (existingGrant) {
      throw new ConflictError('You already have active access to this creator');
    }

    // Calculate grant expiration
    const grantExpiresAt = new Date();
    grantExpiresAt.setDate(grantExpiresAt.getDate() + accessCode.durationDays);

    // Redeem code and create access grant in transaction
    const result = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      // Mark code as redeemed
      await tx.accessCode.update({
        where: { code },
        data: {
          isRedeemed: true,
          redeemedBy: subscriberId,
          redeemedAt: new Date(),
        },
      });

      // Create access grant
      const grant = await tx.accessGrant.create({
        data: {
          subscriberId,
          creatorId: accessCode.creatorId,
          accessCode: code,
          expiresAt: grantExpiresAt,
          isActive: true,
        },
      });

      // Update subscriber profile
      await tx.subscriberProfile.update({
        where: { userId: subscriberId },
        data: {
          activeAccessCount: { increment: 1 },
        },
      });

      // Update creator profile
      await tx.creatorProfile.update({
        where: { userId: accessCode.creatorId },
        data: {
          subscriberCount: { increment: 1 },
        },
      });

      return grant;
    });

    logger.info('Access code redeemed', {
      code,
      subscriberId,
      creatorId: accessCode.creatorId,
      grantId: result.id,
    });

    return {
      success: true,
      accessGrantId: result.id,
      creatorId: accessCode.creatorId,
      expiresAt: result.expiresAt,
    };
  }

  /**
   * Validate if subscriber has access to creator's content
   */
  async validateAccess(request: ValidateAccessRequest): Promise<ValidateAccessResult> {
    const { subscriberId, creatorId } = request;

    if (!validateUUID(subscriberId) || !validateUUID(creatorId)) {
      throw new ValidationError('Invalid ID format');
    }

    const grant = await prisma.accessGrant.findFirst({
      where: {
        subscriberId,
        creatorId,
        isActive: true,
      },
    });

    if (!grant) {
      return { hasAccess: false };
    }

    // Check if grant has expired
    if (grant.expiresAt && grant.expiresAt < new Date()) {
      // Mark as inactive
      await prisma.accessGrant.update({
        where: { id: grant.id },
        data: { isActive: false },
      });

      return { hasAccess: false };
    }

    return {
      hasAccess: true,
      grantId: grant.id,
      expiresAt: grant.expiresAt,
      isActive: grant.isActive,
    };
  }

  /**
   * Invalidate access code (e.g., payment failed or refunded)
   */
  async invalidateAccessCode(request: InvalidateAccessCodeRequest): Promise<void> {
    const { paymentId, reason } = request;

    const accessCode = await prisma.accessCode.findUnique({
      where: { paymentId },
    });

    if (!accessCode) {
      logger.warn('Attempted to invalidate non-existent access code', { paymentId });
      return;
    }

    // If code was already redeemed, revoke the access grant
    if (accessCode.isRedeemed && accessCode.redeemedBy) {
      await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
        // Revoke access grants
        await tx.accessGrant.updateMany({
          where: {
            accessCode: accessCode.code,
            isActive: true,
          },
          data: {
            isActive: false,
            revokedAt: new Date(),
          },
        });

        // Update subscriber profile
        if (accessCode.redeemedBy) {
          await tx.subscriberProfile.update({
            where: { userId: accessCode.redeemedBy },
            data: {
              activeAccessCount: { decrement: 1 },
            },
          });
        }

        // Update creator profile
        await tx.creatorProfile.update({
          where: { userId: accessCode.creatorId },
          data: {
            subscriberCount: { decrement: 1 },
          },
        });

        // Mark code as invalid
        await tx.accessCode.update({
          where: { code: accessCode.code },
          data: { isValid: false },
        });
      });

      logger.info('Access code invalidated and grants revoked', {
        code: accessCode.code,
        paymentId,
        reason,
      });
    } else {
      // Just mark code as invalid
      await prisma.accessCode.update({
        where: { code: accessCode.code },
        data: { isValid: false },
      });

      logger.info('Access code invalidated', {
        code: accessCode.code,
        paymentId,
        reason,
      });
    }
  }

  /**
   * Handle payment webhook
   */
  async handlePaymentWebhook(payload: PaymentWebhookPayload): Promise<void> {
    const { event, paymentId, idempotencyKey } = payload;

    // Check idempotency (prevent duplicate processing)
    // In production, store idempotency keys in database or cache
    logger.info('Payment webhook received', { event, paymentId, idempotencyKey });

    switch (event) {
      case 'payment.success':
        await this.generateAccessCode({
          creatorId: payload.creatorId,
          paymentId: payload.paymentId,
          amount: payload.amount,
          currency: payload.currency,
          durationDays: payload.durationDays,
        });
        break;

      case 'payment.failed':
        await this.invalidateAccessCode({
          paymentId,
          reason: 'Payment failed',
        });
        break;

      case 'payment.refunded':
        await this.invalidateAccessCode({
          paymentId,
          reason: 'Payment refunded',
        });
        break;

      default:
        logger.warn('Unknown payment event type', { event });
    }
  }

  /**
   * Revoke access grant (manual revocation by creator)
   */
  async revokeAccessGrant(grantId: string, revokedBy: string): Promise<void> {
    if (!validateUUID(grantId) || !validateUUID(revokedBy)) {
      throw new ValidationError('Invalid ID format');
    }

    const grant = await prisma.accessGrant.findUnique({
      where: { id: grantId },
    });

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

    await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      // Revoke grant
      await tx.accessGrant.update({
        where: { id: grantId },
        data: {
          isActive: false,
          revokedAt: new Date(),
          revokedBy,
        },
      });

      // Update subscriber profile
      await tx.subscriberProfile.update({
        where: { userId: grant.subscriberId },
        data: {
          activeAccessCount: { decrement: 1 },
        },
      });

      // Update creator profile
      await tx.creatorProfile.update({
        where: { userId: grant.creatorId },
        data: {
          subscriberCount: { decrement: 1 },
        },
      });
    });

    logger.info('Access grant revoked', {
      grantId,
      subscriberId: grant.subscriberId,
      creatorId: grant.creatorId,
      revokedBy,
    });
  }

  /**
   * Get access code by code string
   */
  async getAccessCode(code: string): Promise<AccessCodeData> {
    const accessCode = await prisma.accessCode.findUnique({
      where: { code: code.toUpperCase() },
    });

    if (!accessCode) {
      throw new NotFoundError('Access code');
    }

    return this.mapAccessCodeToData(accessCode);
  }

  /**
   * Map Prisma access code to AccessCodeData
   */
  private mapAccessCodeToData(accessCode: any): AccessCodeData {
    return {
      code: accessCode.code,
      creatorId: accessCode.creatorId,
      paymentId: accessCode.paymentId,
      amount: accessCode.amount,
      currency: accessCode.currency,
      durationDays: accessCode.durationDays,
      expiresAt: accessCode.expiresAt,
      isRedeemed: accessCode.isRedeemed,
      redeemedBy: accessCode.redeemedBy,
      redeemedAt: accessCode.redeemedAt,
      createdAt: accessCode.createdAt,
      isValid: accessCode.isValid,
    };
  }
}

// Export singleton instance
export const accessService = new AccessService();
