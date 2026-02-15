import { Router } from 'express';
import { liveStreamingController } from './live.controller';
import { authenticate, authorizeCreator, authorizeSubscriber } from '../auth/auth.middleware';

const router = Router();

/**
 * Live Streaming Routes
 * Base path: /live
 */

// Public routes (with authentication)
router.get(
  '/streams/active',
  authenticate,
  liveStreamingController.getActiveStreams.bind(liveStreamingController)
);

router.get(
  '/streams/scheduled',
  authenticate,
  liveStreamingController.getScheduledStreams.bind(liveStreamingController)
);

router.get(
  '/streams/:streamId',
  authenticate,
  liveStreamingController.getStream.bind(liveStreamingController)
);

router.get(
  '/streams/:streamId/access',
  authenticate,
  liveStreamingController.validateAccess.bind(liveStreamingController)
);

router.get(
  '/streams/:streamId/stats',
  authenticate,
  liveStreamingController.getStreamStats.bind(liveStreamingController)
);

// Creator routes
router.post(
  '/streams',
  authenticate,
  authorizeCreator,
  liveStreamingController.createStream.bind(liveStreamingController)
);

router.get(
  '/streams/my',
  authenticate,
  authorizeCreator,
  liveStreamingController.getMyStreams.bind(liveStreamingController)
);

router.put(
  '/streams/:streamId',
  authenticate,
  authorizeCreator,
  liveStreamingController.updateStream.bind(liveStreamingController)
);

router.post(
  '/streams/:streamId/end',
  authenticate,
  authorizeCreator,
  liveStreamingController.endStream.bind(liveStreamingController)
);

router.delete(
  '/streams/:streamId',
  authenticate,
  authorizeCreator,
  liveStreamingController.deleteStream.bind(liveStreamingController)
);

// Subscriber routes
router.post(
  '/streams/:streamId/join',
  authenticate,
  authorizeSubscriber,
  liveStreamingController.joinStream.bind(liveStreamingController)
);

router.post(
  '/streams/:streamId/leave',
  authenticate,
  authorizeSubscriber,
  liveStreamingController.leaveStream.bind(liveStreamingController)
);

// Webhook routes (no authentication - secured by stream key or IP whitelist)
router.post(
  '/webhooks/stream/start',
  liveStreamingController.startStream.bind(liveStreamingController)
);

export default router;
