import { Router } from 'express';
import { accessController } from './access.controller';
import { authenticate, authorizeCreator, authorizeSubscriber } from '../auth/auth.middleware';
import { asyncHandler } from '../../shared/errors/errorHandler';

const router = Router();

/**
 * @route   POST /access/redeem
 * @desc    Redeem an access code
 * @access  Private (subscriber only)
 * @body    { code }
 */
router.post(
  '/redeem',
  authenticate,
  authorizeSubscriber,
  asyncHandler(accessController.redeemCode.bind(accessController))
);

/**
 * @route   GET /access/validate/:creatorId
 * @desc    Validate if subscriber has access to creator's content
 * @access  Private (subscriber only)
 */
router.get(
  '/validate/:creatorId',
  authenticate,
  authorizeSubscriber,
  asyncHandler(accessController.validateAccess.bind(accessController))
);

/**
 * @route   POST /access/generate
 * @desc    Generate an access code (for testing/admin)
 * @access  Private (creator only)
 * @body    { creatorId, paymentId, amount, currency, durationDays }
 */
router.post(
  '/generate',
  authenticate,
  authorizeCreator,
  asyncHandler(accessController.generateCode.bind(accessController))
);

/**
 * @route   POST /access/revoke/:grantId
 * @desc    Revoke an access grant
 * @access  Private (creator only)
 */
router.post(
  '/revoke/:grantId',
  authenticate,
  authorizeCreator,
  asyncHandler(accessController.revokeGrant.bind(accessController))
);

/**
 * @route   GET /access/code/:code
 * @desc    Get access code details
 * @access  Private (creator or redeemer only)
 */
router.get(
  '/code/:code',
  authenticate,
  asyncHandler(accessController.getAccessCode.bind(accessController))
);

/**
 * @route   GET /access/my-grants
 * @desc    Get my access grants (current subscriber)
 * @access  Private (subscriber only)
 */
router.get(
  '/my-grants',
  authenticate,
  authorizeSubscriber,
  asyncHandler(accessController.getMyAccessGrants.bind(accessController))
);

/**
 * @route   POST /webhooks/payment
 * @desc    Handle payment webhook events
 * @access  Public (but should verify webhook signature)
 * @body    { event, paymentId, amount, currency, creatorId, durationDays, idempotencyKey, timestamp }
 */
router.post(
  '/webhooks/payment',
  asyncHandler(accessController.handlePaymentWebhook.bind(accessController))
);

export default router;
