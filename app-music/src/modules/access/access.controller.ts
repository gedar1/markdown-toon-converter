import { Response } from 'express';
import { accessService } from './access.service';
import { AuthenticatedRequest } from '../auth/auth.middleware';
import { validateSchema, commonSchemas } from '../../shared/utils/validation';
import { logger } from '../../shared/utils/logger';
import { z } from 'zod';

/**
 * Validation schemas
 */
const redeemCodeSchema = z.object({
  code: z.string().min(1, 'Access code is required'),
});

const validateAccessSchema = z.object({
  creatorId: commonSchemas.uuid,
});

const generateCodeSchema = z.object({
  creatorId: commonSchemas.uuid,
  paymentId: z.string().min(1, 'Payment ID is required'),
  amount: commonSchemas.positiveInt,
  currency: z.string().length(3, 'Currency must be 3 characters (e.g., USD)'),
  durationDays: commonSchemas.positiveInt,
});

const paymentWebhookSchema = z.object({
  event: z.enum(['payment.success', 'payment.failed', 'payment.refunded']),
  paymentId: z.string().min(1),
  amount: z.number().positive(),
  currency: z.string().length(3),
  creatorId: commonSchemas.uuid,
  durationDays: z.number().int().positive(),
  idempotencyKey: z.string().min(1),
  timestamp: z.string(),
});

/**
 * Access Control Controller
 */
export class AccessController {
  /**
   * Redeem access code
   * POST /access/redeem
   * Requires authentication (subscriber)
   */
  async redeemCode(req: AuthenticatedRequest, res: Response): Promise<void> {
    if (!req.user) {
      res.status(401).json({
        status: 'error',
        code: 'AUTHENTICATION_ERROR',
        message: 'Authentication required',
        timestamp: new Date().toISOString(),
      });
      return;
    }

    if (req.user.userType !== 'subscriber') {
      res.status(403).json({
        status: 'error',
        code: 'ACCESS_DENIED',
        message: 'Only subscribers can redeem access codes',
        timestamp: new Date().toISOString(),
      });
      return;
    }

    const data = validateSchema(redeemCodeSchema, req.body);

    const result = await accessService.redeemAccessCode({
      code: data.code,
      subscriberId: req.user.userId,
    });

    logger.info('Access code redeemed via API', {
      subscriberId: req.user.userId,
      code: data.code,
    });

    res.status(200).json({
      status: 'success',
      data: result,
      message: 'Access code redeemed successfully',
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Validate access
   * GET /access/validate/:creatorId
   * Requires authentication (subscriber)
   */
  async validateAccess(req: AuthenticatedRequest, res: Response): Promise<void> {
    if (!req.user) {
      res.status(401).json({
        status: 'error',
        code: 'AUTHENTICATION_ERROR',
        message: 'Authentication required',
        timestamp: new Date().toISOString(),
      });
      return;
    }

    if (req.user.userType !== 'subscriber') {
      res.status(403).json({
        status: 'error',
        code: 'ACCESS_DENIED',
        message: 'Only subscribers can validate access',
        timestamp: new Date().toISOString(),
      });
      return;
    }

    const { creatorId } = req.params;

    const result = await accessService.validateAccess({
      subscriberId: req.user.userId,
      creatorId,
    });

    res.status(200).json({
      status: 'success',
      data: result,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Generate access code (for testing/admin purposes)
   * POST /access/generate
   * Requires authentication (creator)
   */
  async generateCode(req: AuthenticatedRequest, res: Response): Promise<void> {
    if (!req.user) {
      res.status(401).json({
        status: 'error',
        code: 'AUTHENTICATION_ERROR',
        message: 'Authentication required',
        timestamp: new Date().toISOString(),
      });
      return;
    }

    const data = validateSchema(generateCodeSchema, req.body);

    // Verify user is generating code for themselves
    if (req.user.userId !== data.creatorId) {
      res.status(403).json({
        status: 'error',
        code: 'ACCESS_DENIED',
        message: 'You can only generate codes for yourself',
        timestamp: new Date().toISOString(),
      });
      return;
    }

    const result = await accessService.generateAccessCode(data);

    logger.info('Access code generated via API', {
      creatorId: data.creatorId,
      paymentId: data.paymentId,
    });

    res.status(201).json({
      status: 'success',
      data: result,
      message: 'Access code generated successfully',
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Payment webhook handler
   * POST /webhooks/payment
   * Public endpoint (but should verify webhook signature in production)
   */
  async handlePaymentWebhook(req: AuthenticatedRequest, res: Response): Promise<void> {
    // In production, verify webhook signature here
    // const signature = req.headers['x-webhook-signature'];
    // if (!verifyWebhookSignature(signature, req.body)) {
    //   return res.status(401).json({ error: 'Invalid signature' });
    // }

    const payload = validateSchema(paymentWebhookSchema, req.body);

    await accessService.handlePaymentWebhook(payload);

    logger.info('Payment webhook processed', {
      event: payload.event,
      paymentId: payload.paymentId,
    });

    res.status(200).json({
      status: 'success',
      message: 'Webhook processed successfully',
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Revoke access grant
   * POST /access/revoke/:grantId
   * Requires authentication (creator)
   */
  async revokeGrant(req: AuthenticatedRequest, res: Response): Promise<void> {
    if (!req.user) {
      res.status(401).json({
        status: 'error',
        code: 'AUTHENTICATION_ERROR',
        message: 'Authentication required',
        timestamp: new Date().toISOString(),
      });
      return;
    }

    if (req.user.userType !== 'creator') {
      res.status(403).json({
        status: 'error',
        code: 'ACCESS_DENIED',
        message: 'Only creators can revoke access',
        timestamp: new Date().toISOString(),
      });
      return;
    }

    const { grantId } = req.params;

    await accessService.revokeAccessGrant(grantId, req.user.userId);

    logger.info('Access grant revoked via API', {
      grantId,
      creatorId: req.user.userId,
    });

    res.status(200).json({
      status: 'success',
      message: 'Access grant revoked successfully',
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Get access code details
   * GET /access/code/:code
   * Requires authentication
   */
  async getAccessCode(req: AuthenticatedRequest, res: Response): Promise<void> {
    if (!req.user) {
      res.status(401).json({
        status: 'error',
        code: 'AUTHENTICATION_ERROR',
        message: 'Authentication required',
        timestamp: new Date().toISOString(),
      });
      return;
    }

    const { code } = req.params;

    const accessCode = await accessService.getAccessCode(code);

    // Only allow creator or redeemer to view code details
    if (req.user.userId !== accessCode.creatorId && req.user.userId !== accessCode.redeemedBy) {
      res.status(403).json({
        status: 'error',
        code: 'ACCESS_DENIED',
        message: 'You do not have permission to view this access code',
        timestamp: new Date().toISOString(),
      });
      return;
    }

    res.status(200).json({
      status: 'success',
      data: accessCode,
      timestamp: new Date().toISOString(),
    });
  }
}

// Export singleton instance
export const accessController = new AccessController();
