import { Request, Response, NextFunction } from 'express';
import { liveStreamingService } from './live.service';
import { logger } from '../../shared/utils/logger';
import type { CreateLiveStreamRequest, UpdateLiveStreamRequest } from './live.types';

/**
 * Live Streaming Controller
 */
export class LiveStreamingController {
  /**
   * Create a new live stream
   * POST /live/streams
   */
  async createStream(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const userType = req.user!.userType;

      if (userType !== 'creator') {
        return res.status(403).json({
          status: 'error',
          message: 'Only creators can create live streams',
        });
      }

      const data: CreateLiveStreamRequest = req.body;

      const stream = await liveStreamingService.createLiveStream(userId, data);

      logger.info('Live stream created', { streamId: stream.id, creatorId: userId });

      res.status(201).json({
        status: 'success',
        data: stream,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get a specific live stream
   * GET /live/streams/:streamId
   */
  async getStream(req: Request, res: Response, next: NextFunction) {
    try {
      const { streamId } = req.params;

      const stream = await liveStreamingService.getLiveStream(streamId);

      res.json({
        status: 'success',
        data: stream,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get all streams for the authenticated creator
   * GET /live/streams/my
   */
  async getMyStreams(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const { status } = req.query;

      const streams = await liveStreamingService.getCreatorStreams(
        userId,
        status as string | undefined
      );

      res.json({
        status: 'success',
        data: streams,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get all active (live) streams
   * GET /live/streams/active
   */
  async getActiveStreams(req: Request, res: Response, next: NextFunction) {
    try {
      const streams = await liveStreamingService.getActiveStreams();

      res.json({
        status: 'success',
        data: streams,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get all scheduled (upcoming) streams
   * GET /live/streams/scheduled
   */
  async getScheduledStreams(req: Request, res: Response, next: NextFunction) {
    try {
      const streams = await liveStreamingService.getScheduledStreams();

      res.json({
        status: 'success',
        data: streams,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update a live stream
   * PUT /live/streams/:streamId
   */
  async updateStream(req: Request, res: Response, next: NextFunction) {
    try {
      const { streamId } = req.params;
      const userId = req.user!.userId;
      const data: UpdateLiveStreamRequest = req.body;

      const stream = await liveStreamingService.updateLiveStream(streamId, userId, data);

      logger.info('Live stream updated', { streamId, creatorId: userId });

      res.json({
        status: 'success',
        data: stream,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Start a live stream (webhook from streaming server)
   * POST /live/streams/start
   */
  async startStream(req: Request, res: Response, next: NextFunction) {
    try {
      const { streamKey } = req.body;

      if (!streamKey) {
        return res.status(400).json({
          status: 'error',
          message: 'Stream key is required',
        });
      }

      const stream = await liveStreamingService.startStream(streamKey);

      logger.info('Live stream started', { streamId: stream.id, streamKey });

      res.json({
        status: 'success',
        data: stream,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * End a live stream
   * POST /live/streams/:streamId/end
   */
  async endStream(req: Request, res: Response, next: NextFunction) {
    try {
      const { streamId } = req.params;
      const userId = req.user!.userId;

      const stream = await liveStreamingService.endStream(streamId, userId);

      logger.info('Live stream ended', { streamId, creatorId: userId });

      res.json({
        status: 'success',
        data: stream,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Join a live stream as a viewer
   * POST /live/streams/:streamId/join
   */
  async joinStream(req: Request, res: Response, next: NextFunction) {
    try {
      const { streamId } = req.params;
      const userId = req.user!.userId;
      const userType = req.user!.userType;

      if (userType !== 'subscriber') {
        return res.status(403).json({
          status: 'error',
          message: 'Only subscribers can join live streams',
        });
      }

      const viewer = await liveStreamingService.joinStream(streamId, userId);

      logger.info('Viewer joined stream', { streamId, subscriberId: userId });

      res.json({
        status: 'success',
        data: viewer,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Leave a live stream
   * POST /live/streams/:streamId/leave
   */
  async leaveStream(req: Request, res: Response, next: NextFunction) {
    try {
      const { streamId } = req.params;
      const userId = req.user!.userId;

      await liveStreamingService.leaveStream(streamId, userId);

      logger.info('Viewer left stream', { streamId, subscriberId: userId });

      res.json({
        status: 'success',
        message: 'Left stream successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get stream statistics
   * GET /live/streams/:streamId/stats
   */
  async getStreamStats(req: Request, res: Response, next: NextFunction) {
    try {
      const { streamId } = req.params;

      const stats = await liveStreamingService.getStreamStats(streamId);

      res.json({
        status: 'success',
        data: stats,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete a live stream
   * DELETE /live/streams/:streamId
   */
  async deleteStream(req: Request, res: Response, next: NextFunction) {
    try {
      const { streamId } = req.params;
      const userId = req.user!.userId;

      await liveStreamingService.deleteStream(streamId, userId);

      logger.info('Live stream deleted', { streamId, creatorId: userId });

      res.json({
        status: 'success',
        message: 'Stream deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Validate stream access for a subscriber
   * GET /live/streams/:streamId/access
   */
  async validateAccess(req: Request, res: Response, next: NextFunction) {
    try {
      const { streamId } = req.params;
      const userId = req.user!.userId;

      const hasAccess = await liveStreamingService.validateStreamAccess(streamId, userId);

      res.json({
        status: 'success',
        data: {
          hasAccess,
        },
      });
    } catch (error) {
      next(error);
    }
  }
}

export const liveStreamingController = new LiveStreamingController();
