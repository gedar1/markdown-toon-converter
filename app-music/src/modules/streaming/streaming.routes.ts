import { Router } from 'express';
import { streamingController } from './streaming.controller';
import { authenticate, authorizeCreator, authorizeSubscriber } from '../auth/auth.middleware';
import { asyncHandler } from '../../shared/errors/errorHandler';

const router = Router();

/**
 * @route   POST /stream/init
 * @desc    Initialize a new stream session
 * @access  Private (subscriber only)
 * @body    { contentId }
 */
router.post(
  '/init',
  authenticate,
  authorizeSubscriber,
  asyncHandler(streamingController.initializeStream.bind(streamingController))
);

/**
 * @route   GET /stream/:sessionId/manifest.m3u8
 * @desc    Get HLS manifest for stream session
 * @access  Public (but validates session access)
 */
router.get(
  '/:sessionId/manifest.m3u8',
  asyncHandler(streamingController.getManifest.bind(streamingController))
);

/**
 * @route   GET /stream/:sessionId/segment/:segmentId.ts
 * @desc    Get stream segment
 * @access  Public (but validates session access)
 */
router.get(
  '/:sessionId/segment/:segmentId.ts',
  asyncHandler(streamingController.getSegment.bind(streamingController))
);

/**
 * @route   POST /stream/:sessionId/end
 * @desc    End stream session and record analytics
 * @access  Private (subscriber only)
 * @body    { duration, bytesTransferred, completionPercentage }
 */
router.post(
  '/:sessionId/end',
  authenticate,
  authorizeSubscriber,
  asyncHandler(streamingController.endStream.bind(streamingController))
);

/**
 * @route   GET /stream/:sessionId
 * @desc    Get stream session details
 * @access  Private (subscriber or creator)
 */
router.get(
  '/:sessionId',
  authenticate,
  asyncHandler(streamingController.getStreamSession.bind(streamingController))
);

/**
 * @route   GET /stream/analytics/creator/:creatorId
 * @desc    Get creator's stream analytics
 * @access  Private (creator only, own analytics)
 */
router.get(
  '/analytics/creator/:creatorId',
  authenticate,
  authorizeCreator,
  asyncHandler(streamingController.getCreatorAnalytics.bind(streamingController))
);

/**
 * @route   GET /stream/history/subscriber/:subscriberId
 * @desc    Get subscriber's stream history
 * @access  Private (subscriber only, own history)
 * @query   limit (optional)
 */
router.get(
  '/history/subscriber/:subscriberId',
  authenticate,
  authorizeSubscriber,
  asyncHandler(streamingController.getSubscriberHistory.bind(streamingController))
);

export default router;
