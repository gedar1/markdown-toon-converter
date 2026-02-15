import { Response } from 'express';
import { paymentService } from './payment.service';
import { AuthenticatedRequest } from '../auth/auth.middleware';
import { validateSchema, commonSchemas } from '../../shared/utils/validation';
import { logger } from '../../shared/utils/logger';
import { z } from 'zod';

/**
 * Validation schemas
 */
const createCheckoutSchema = z.object({
  creatorId: commonSchemas.uuid,
  customAmount: z.number().int().positive().optional(),
  durationDays: z.number().int().positive().optional(),
});

const createPlanSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500),
  amount: z.number().int().positive(),
  durationDays: z.number().int().positive(),
});

/**
 * Payment Controller
 */
export class PaymentController {
  /**
   * Create checkout session
   * POST /payments/checkout
   * Requires authentication (subscriber)
   */
  async createCheckout(req: AuthenticatedRequest, res: Response): Promise<void> {
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
        message: 'Only subscribers can purchase access',
        timestamp: new Date().toISOString(),
      });
      return;
    }

    const data = validateSchema(createCheckoutSchema, req.body);

    const session = await paymentService.createCheckoutSession(req.user.userId, data);

    logger.info('Checkout session created via API', {
      subscriberId: req.user.userId,
      creatorId: data.creatorId,
    });

    res.status(200).json({
      status: 'success',
      data: session,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Handle Stripe webhook
   * POST /payments/webhook
   * Public endpoint (signature verified)
   */
  async handleWebhook(req: AuthenticatedRequest, res: Response): Promise<void> {
    const signature = req.headers['stripe-signature'] as string;

    if (!signature) {
      res.status(400).json({
        status: 'error',
        message: 'Missing stripe-signature header',
      });
      return;
    }

    try {
      // Verify webhook signature and get event
      const event = paymentService.verifyWebhookSignature(req.body, signature);

      // Process webhook event
      await paymentService.handleWebhook(event);

      res.status(200).json({ received: true });
    } catch (error: any) {
      logger.error('Webhook processing failed', { error: error.message });
      res.status(400).json({
        status: 'error',
        message: error.message,
      });
    }
  }

  /**
   * Get checkout session details
   * GET /payments/session/:sessionId
   * Requires authentication
   */
  async getSession(req: AuthenticatedRequest, res: Response): Promise<void> {
    if (!req.user) {
      res.status(401).json({
        status: 'error',
        code: 'AUTHENTICATION_ERROR',
        message: 'Authentication required',
        timestamp: new Date().toISOString(),
      });
      return;
    }

    const { sessionId } = req.params;

    const session = await paymentService.getCheckoutSession(sessionId);

    res.status(200).json({
      status: 'success',
      data: {
        id: session.id,
        status: session.status,
        paymentStatus: session.payment_status,
        amountTotal: session.amount_total,
        currency: session.currency,
        metadata: session.metadata,
      },
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Create subscription plan
   * POST /payments/plans
   * Requires authentication (creator)
   */
  async createPlan(req: AuthenticatedRequest, res: Response): Promise<void> {
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
        message: 'Only creators can create subscription plans',
        timestamp: new Date().toISOString(),
      });
      return;
    }

    const data = validateSchema(createPlanSchema, req.body);

    const plan = await paymentService.createSubscriptionPlan(req.user.userId, data);

    logger.info('Subscription plan created', {
      creatorId: req.user.userId,
      planId: plan.id,
    });

    res.status(201).json({
      status: 'success',
      data: plan,
      message: 'Subscription plan created successfully',
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Get creator's subscription plans
   * GET /payments/plans/:creatorId
   * Public endpoint
   */
  async getCreatorPlans(req: AuthenticatedRequest, res: Response): Promise<void> {
    const { creatorId } = req.params;

    const plans = await paymentService.getCreatorPlans(creatorId);

    res.status(200).json({
      status: 'success',
      data: plans,
      timestamp: new Date().toISOString(),
    });
  }
}

export const paymentController = new PaymentController();
