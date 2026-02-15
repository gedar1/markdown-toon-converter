import { Router } from 'express';
import { paymentController } from './payment.controller';
import { authenticate, authorizeCreator, authorizeSubscriber } from '../auth/auth.middleware';
import { asyncHandler } from '../../shared/errors/errorHandler';
import express from 'express';

const router = Router();

/**
 * @route   POST /payments/checkout
 * @desc    Create Stripe checkout session
 * @access  Private (subscriber only)
 * @body    { creatorId, customAmount?, durationDays? }
 */
router.post(
  '/checkout',
  authenticate,
  authorizeSubscriber,
  asyncHandler(paymentController.createCheckout.bind(paymentController))
);

/**
 * @route   POST /payments/webhook
 * @desc    Handle Stripe webhook events
 * @access  Public (signature verified)
 * @note    Must use raw body for signature verification
 */
router.post(
  '/webhook',
  express.raw({ type: 'application/json' }),
  asyncHandler(paymentController.handleWebhook.bind(paymentController))
);

/**
 * @route   GET /payments/session/:sessionId
 * @desc    Get checkout session details
 * @access  Private
 */
router.get(
  '/session/:sessionId',
  authenticate,
  asyncHandler(paymentController.getSession.bind(paymentController))
);

/**
 * @route   POST /payments/plans
 * @desc    Create subscription plan
 * @access  Private (creator only)
 * @body    { name, description, amount, durationDays }
 */
router.post(
  '/plans',
  authenticate,
  authorizeCreator,
  asyncHandler(paymentController.createPlan.bind(paymentController))
);

/**
 * @route   GET /payments/plans/:creatorId
 * @desc    Get creator's subscription plans
 * @access  Public
 */
router.get(
  '/plans/:creatorId',
  asyncHandler(paymentController.getCreatorPlans.bind(paymentController))
);

export default router;
