import { IAccessRepository } from '../repositories/IAccessRepository';
import { ICodeGeneratorService } from '../repositories/ICodeGeneratorService';
import { ValidationError } from '../../../shared/errors/AppError';
import { validateUUID } from '../../../shared/utils/validation';
import { logger } from '../../../shared/utils/logger';

/**
 * Generate access code input
 */
export interface GenerateAccessCodeInput {
  creatorId: string;
  paymentId: string;
  amount: number;
  currency: string;
  durationDays: number;
}

/**
 * Generate access code output
 */
export interface GenerateAccessCodeOutput {
  code: string;
  creatorId: string;
  paymentId: string;
  amount: number;
  currency: string;
  durationDays: number;
  expiresAt: Date | null;
  isRedeemed: boolean;
  isValid: boolean;
  createdAt: Date;
}

/**
 * Generate Access Code Use Case
 */
export class GenerateAccessCode {
  constructor(
    readonly accessRepository: IAccessRepository,
    readonly codeGenerator: ICodeGeneratorService
  ) {}

  async execute(input: GenerateAccessCodeInput): Promise<GenerateAccessCodeOutput> {
    const { creatorId, paymentId, amount, currency, durationDays } = input;

    // Validate creator ID
    if (!validateUUID(creatorId)) {
      throw new ValidationError('Invalid creator ID format');
    }

    // Check if payment ID already has a code (idempotency)
    const existingCode = await this.accessRepository.findAccessCodeByPaymentId(paymentId);

    if (existingCode) {
      logger.info('Access code already exists for payment', { paymentId });
      return {
        code: existingCode.code,
        creatorId: existingCode.creatorId,
        paymentId: existingCode.paymentId,
        amount: existingCode.amount,
        currency: existingCode.currency,
        durationDays: existingCode.durationDays,
        expiresAt: existingCode.expiresAt,
        isRedeemed: existingCode.isRedeemed,
        isValid: existingCode.isValid,
        createdAt: existingCode.createdAt,
      };
    }

    // Generate unique code
    const code = await this.codeGenerator.generateUniqueCode(async (c) => {
      const existing = await this.accessRepository.findAccessCodeByCode(c);
      return !!existing;
    });

    // Create access code (code doesn't expire, but access grant does)
    const accessCode = await this.accessRepository.createAccessCode({
      code,
      creatorId,
      paymentId,
      amount,
      currency,
      durationDays,
      expiresAt: null,
    });

    logger.info('Access code generated', {
      code,
      creatorId,
      paymentId,
      durationDays,
    });

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
}
