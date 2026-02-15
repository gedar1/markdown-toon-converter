import {
  GenerateAccessCode,
  GenerateAccessCodeInput,
  GenerateAccessCodeOutput,
} from '../../domain/access/use-cases/GenerateAccessCode';
import {
  RedeemAccessCode,
  RedeemAccessCodeInput,
  RedeemAccessCodeOutput,
} from '../../domain/access/use-cases/RedeemAccessCode';
import {
  ValidateAccess,
  ValidateAccessInput,
  ValidateAccessOutput,
} from '../../domain/access/use-cases/ValidateAccess';
import {
  RevokeAccessGrant,
  RevokeAccessGrantInput,
} from '../../domain/access/use-cases/RevokeAccessGrant';
import { PrismaAccessRepository } from '../../infrastructure/persistence/PrismaAccessRepository';
import { AccessCodeGeneratorService } from '../../infrastructure/services/AccessCodeGeneratorService';
import { logger } from '../../shared/utils/logger';

/**
 * Payment webhook payload
 */
export interface PaymentWebhookPayload {
  event: 'payment.success' | 'payment.failed' | 'payment.refunded';
  paymentId: string;
  idempotencyKey: string;
  creatorId: string;
  amount: number;
  currency: string;
  durationDays: number;
}

/**
 * Application Service for Access Management
 * Orchestrates use cases and dependency injection
 */
export class AccessService {
  readonly generateAccessCodeUseCase: GenerateAccessCode;
  readonly redeemAccessCodeUseCase: RedeemAccessCode;
  readonly validateAccessUseCase: ValidateAccess;
  readonly revokeAccessGrantUseCase: RevokeAccessGrant;
  readonly accessRepository: PrismaAccessRepository;

  constructor() {
    // Dependency Injection - Create adapters
    this.accessRepository = new PrismaAccessRepository();
    const codeGenerator = new AccessCodeGeneratorService();

    // Initialize use cases with dependencies
    this.generateAccessCodeUseCase = new GenerateAccessCode(this.accessRepository, codeGenerator);
    this.redeemAccessCodeUseCase = new RedeemAccessCode(this.accessRepository);
    this.validateAccessUseCase = new ValidateAccess(this.accessRepository);
    this.revokeAccessGrantUseCase = new RevokeAccessGrant(this.accessRepository);
  }

  /**
   * Generate access code
   */
  async generateAccessCode(input: GenerateAccessCodeInput): Promise<GenerateAccessCodeOutput> {
    return await this.generateAccessCodeUseCase.execute(input);
  }

  /**
   * Redeem access code
   */
  async redeemAccessCode(input: RedeemAccessCodeInput): Promise<RedeemAccessCodeOutput> {
    return await this.redeemAccessCodeUseCase.execute(input);
  }

  /**
   * Validate access
   */
  async validateAccess(input: ValidateAccessInput): Promise<ValidateAccessOutput> {
    return await this.validateAccessUseCase.execute(input);
  }

  /**
   * Revoke access grant
   */
  async revokeAccessGrant(input: RevokeAccessGrantInput): Promise<void> {
    return await this.revokeAccessGrantUseCase.execute(input);
  }

  /**
   * Invalidate access code
   */
  async invalidateAccessCode(paymentId: string, reason: string): Promise<void> {
    const accessCode = await this.accessRepository.findAccessCodeByPaymentId(paymentId);

    if (!accessCode) {
      logger.warn('Attempted to invalidate non-existent access code', { paymentId });
      return;
    }

    await this.accessRepository.invalidateAccessCode(accessCode.code, accessCode.redeemedBy);

    logger.info('Access code invalidated', {
      code: accessCode.code,
      paymentId,
      reason,
    });
  }

  /**
   * Handle payment webhook
   */
  async handlePaymentWebhook(payload: PaymentWebhookPayload): Promise<void> {
    const { event, paymentId, idempotencyKey } = payload;

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
        await this.invalidateAccessCode(paymentId, 'Payment failed');
        break;

      case 'payment.refunded':
        await this.invalidateAccessCode(paymentId, 'Payment refunded');
        break;

      default:
        logger.warn('Unknown payment event type', { event });
    }
  }

  /**
   * Get access code by code string
   */
  async getAccessCode(code: string): Promise<GenerateAccessCodeOutput> {
    const accessCode = await this.accessRepository.findAccessCodeByCode(code.toUpperCase());

    if (!accessCode) {
      throw new Error('Access code not found');
    }

    return {
      code: accessCode.code,
      creatorId: accessCode.creatorId,
      paymentId: accessCode.paymentId,
      amount: accessCode.amount,
      currency: accessCode.currency,
      durationDays: accessCode.durationDays,
      expiresAt: accessCode.expiresAt,
      isRedeemed: accessCode.isRedeemed,
      isValid: accessCode.isValid,
      createdAt: accessCode.createdAt,
    };
  }

  /**
   * Get subscriber access grants
   */
  async getSubscriberAccessGrants(subscriberId: string) {
    return await this.accessRepository.findGrantsBySubscriber(subscriberId);
  }
}

// Export singleton instance
export const accessService = new AccessService();
