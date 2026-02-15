import Stripe from 'stripe';
import { prisma } from '../../shared/database/client';
import { NotFoundError, ValidationError } from '../../shared/errors/AppError';
import { logger } from '../../shared/utils/logger';
import { accessService } from '../../application/access/AccessService';
import type { CreateCheckoutRequest, CheckoutSession } from './payment.types';

/**
 * Payment Service using Stripe
 */
class PaymentService {
  private stripe: Stripe;

  constructor() {
    const stripeKey = process.env.STRIPE_SECRET_KEY;

    if (!stripeKey) {
      logger.warn('STRIPE_SECRET_KEY not configured. Payment features will be disabled.');
      // Create a mock stripe instance for development
      this.stripe = null as any;
    } else {
      this.stripe = new Stripe(stripeKey, {
        apiVersion: '2023-10-16',
      });
    }
  }

  /**
   * Create Stripe Checkout Session
   */
  async createCheckoutSession(
    subscriberId: string,
    request: CreateCheckoutRequest
  ): Promise<CheckoutSession> {
    if (!this.stripe) {
      throw new ValidationError('Payment system is not configured');
    }

    const { creatorId, customAmount, durationDays = 30 } = request;

    // Verify creator exists
    const creator = await prisma.creatorProfile.findUnique({
      where: { userId: creatorId },
      include: { user: true },
    });

    if (!creator) {
      throw new NotFoundError('Creator not found');
    }

    // Get subscriber info
    const subscriber = await prisma.user.findUnique({
      where: { id: subscriberId },
    });

    if (!subscriber) {
      throw new NotFoundError('Subscriber not found');
    }

    // Default amount: $9.99
    const amount = customAmount || 999;

    // Create Stripe Checkout Session
    const session = await this.stripe.checkout.sessions.create({
      mode: 'payment',
      customer_email: subscriber.email,
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `Access to ${creator.user.displayName}`,
              description: `${durationDays} days of access to live streams and content`,
              images: creator.user.avatarUrl ? [creator.user.avatarUrl] : undefined,
            },
            unit_amount: amount,
          },
          quantity: 1,
        },
      ],
      success_url: `${process.env.FRONTEND_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/creator/${creatorId}`,
      metadata: {
        creatorId,
        subscriberId,
        durationDays: durationDays.toString(),
        amount: amount.toString(),
      },
    });

    logger.info('Checkout session created', {
      sessionId: session.id,
      subscriberId,
      creatorId,
      amount,
    });

    return {
      sessionId: session.id,
      url: session.url!,
      expiresAt: new Date(session.expires_at * 1000),
    };
  }

  /**
   * Handle Stripe Webhook Events
   */
  async handleWebhook(event: Stripe.Event): Promise<void> {
    logger.info('Stripe webhook received', { type: event.type });

    switch (event.type) {
      case 'checkout.session.completed':
        await this.handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
        break;

      case 'payment_intent.succeeded':
        logger.info('Payment succeeded', { paymentIntentId: event.data.object.id });
        break;

      case 'payment_intent.payment_failed':
        await this.handlePaymentFailed(event.data.object as Stripe.PaymentIntent);
        break;

      default:
        logger.info('Unhandled webhook event type', { type: event.type });
    }
  }

  /**
   * Handle successful checkout
   */
  private async handleCheckoutCompleted(session: Stripe.Checkout.Session): Promise<void> {
    const { creatorId, subscriberId, durationDays, amount } = session.metadata!;

    logger.info('Processing completed checkout', {
      sessionId: session.id,
      subscriberId,
      creatorId,
    });

    try {
      // 1. Generate access code
      const accessCode = await accessService.generateAccessCode({
        creatorId,
        paymentId: session.payment_intent as string,
        amount: parseInt(amount),
        currency: 'USD',
        durationDays: parseInt(durationDays),
      });

      logger.info('Access code generated', { code: accessCode.code });

      // 2. Automatically redeem the code for the subscriber
      await accessService.redeemAccessCode({
        code: accessCode.code,
        subscriberId,
      });

      logger.info('Access code auto-redeemed', {
        code: accessCode.code,
        subscriberId,
      });

      // 3. TODO: Send confirmation email to subscriber
      // await emailService.sendAccessGrantedEmail(subscriber, creator);
    } catch (error) {
      logger.error('Failed to process checkout completion', {
        error,
        sessionId: session.id,
      });
      throw error;
    }
  }

  /**
   * Handle failed payment
   */
  private async handlePaymentFailed(paymentIntent: Stripe.PaymentIntent): Promise<void> {
    logger.warn('Payment failed', {
      paymentIntentId: paymentIntent.id,
      error: paymentIntent.last_payment_error?.message,
    });

    // TODO: Notify user about failed payment
  }

  /**
   * Verify Stripe webhook signature
   */
  verifyWebhookSignature(payload: string | Buffer, signature: string): Stripe.Event {
    if (!this.stripe) {
      throw new ValidationError('Payment system is not configured');
    }

    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!webhookSecret) {
      throw new ValidationError('Stripe webhook secret is not configured');
    }

    try {
      return this.stripe.webhooks.constructEvent(payload, signature, webhookSecret);
    } catch (error) {
      logger.error('Webhook signature verification failed', { error });
      throw new ValidationError('Invalid webhook signature');
    }
  }

  /**
   * Get checkout session details
   */
  async getCheckoutSession(sessionId: string): Promise<Stripe.Checkout.Session> {
    if (!this.stripe) {
      throw new ValidationError('Payment system is not configured');
    }

    return await this.stripe.checkout.sessions.retrieve(sessionId);
  }

  /**
   * Create subscription plan for creator
   */
  async createSubscriptionPlan(
    creatorId: string,
    data: {
      name: string;
      description: string;
      amount: number;
      durationDays: number;
    }
  ) {
    // Verify creator exists
    const creator = await prisma.creatorProfile.findUnique({
      where: { userId: creatorId },
    });

    if (!creator) {
      throw new NotFoundError('Creator not found');
    }

    // Create Stripe product and price (if Stripe is configured)
    let stripePriceId: string | null = null;

    if (this.stripe) {
      const creatorUser = await prisma.user.findUnique({
        where: { id: creatorId },
      });

      const product = await this.stripe.products.create({
        name: `${creatorUser?.displayName || 'Creator'} - ${data.name}`,
        description: data.description,
      });

      const price = await this.stripe.prices.create({
        product: product.id,
        unit_amount: data.amount,
        currency: 'usd',
      });

      stripePriceId = price.id;
    }

    // Save to database
    const plan = await prisma.subscriptionPlan.create({
      data: {
        creatorId,
        name: data.name,
        description: data.description,
        amount: data.amount,
        currency: 'USD',
        durationDays: data.durationDays,
        stripePriceId,
        isActive: true,
      },
    });

    return plan;
  }

  /**
   * Get creator's subscription plans
   */
  async getCreatorPlans(creatorId: string) {
    return await prisma.subscriptionPlan.findMany({
      where: {
        creatorId,
        isActive: true,
      },
      orderBy: {
        amount: 'asc',
      },
    });
  }
}

export const paymentService = new PaymentService();
