import { Response } from 'express';
import { streamingService } from './streaming.service';
import { AuthenticatedRequest } from '../auth/auth.middleware';
import { validateSchema, commonSchemas } from '../../shared/utils/validation';
import { logger } from '../../shared/utils/logger';
import { z } from 'zod';
import * as fs from 'fs';

/**
 * Validation schemas
 */
const initializeStreamSchema = z.object({
  contentId: commonSchemas.uuid,
});

const endStreamSchema = z.object({
  duration: commonSchemas.nonNegativeInt,
  bytesTransferred: z.string().regex(/^\d+$/, 'Must be a valid number'),
  completionPercentage: z.number().min(0).max(100),
});

/**
 * Streaming Controller
 */
export class StreamingController {
  /**
   * Initialize stream
   * POST /stream/init
   */
  async initializeStream(req: AuthenticatedRequest, res: Response): Promise<void> {
    if (!req.user || req.user.userType !== 'subscriber') {
      res.status(403).json({
        status: 'error',
        code: 'ACCESS_DENIED',
        message: 'Only subscribers can stream content',
        timestamp: new Date().toISOString(),
      });
      return;
    }

    const data = validateSchema(initializeStreamSchema, req.body);

    const result = await streamingService.initializeStream({
      subscriberId: req.user.userId,
      contentId: data.contentId,
    });

    logger.info('Stream initialized via API', {
      sessionId: result.sessionId,
      subscriberId: req.user.userId,
      contentId: data.contentId,
    });

    res.status(200).json({
      status: 'success',
      data: result,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Get HLS manifest
   * GET /stream/:sessionId/manifest.m3u8
   */
  async getManifest(req: AuthenticatedRequest, res: Response): Promise<void> {
    const { sessionId } = req.params;

    const manifest = await streamingService.getStreamManifest(sessionId);
    const m3u8Content = streamingService.generateM3U8Content(manifest);

    res.setHeader('Content-Type', 'application/vnd.apple.mpegurl');
    res.setHeader('Cache-Control', 'no-cache');
    res.send(m3u8Content);
  }

  /**
   * Get stream segment
   * GET /stream/:sessionId/segment/:segmentId.ts
   */
  async getSegment(req: AuthenticatedRequest, res: Response): Promise<void> {
    const { sessionId, segmentId } = req.params;

    const segment = await streamingService.getStreamSegment(sessionId, parseInt(segmentId, 10));

    // Stream the file
    res.setHeader('Content-Type', segment.mimeType);
    res.setHeader('Accept-Ranges', 'bytes');

    const fileStream = fs.createReadStream(segment.filePath);
    fileStream.pipe(res);

    fileStream.on('error', (error) => {
      logger.error('Error streaming segment', { sessionId, segmentId, error });
      if (!res.headersSent) {
        res.status(500).json({
          status: 'error',
          code: 'STREAM_ERROR',
          message: 'Error streaming content',
          timestamp: new Date().toISOString(),
        });
      }
    });
  }

  /**
   * End stream session
   * POST /stream/:sessionId/end
   */
  async endStream(req: AuthenticatedRequest, res: Response): Promise<void> {
    if (!req.user || req.user.userType !== 'subscriber') {
      res.status(403).json({
        status: 'error',
        code: 'ACCESS_DENIED',
        message: 'Only subscribers can end streams',
        timestamp: new Date().toISOString(),
      });
      return;
    }

    const { sessionId } = req.params;
    const data = validateSchema(endStreamSchema, req.body);

    await streamingService.endStream({
      sessionId,
      duration: data.duration,
      bytesTransferred: BigInt(data.bytesTransferred),
      completionPercentage: data.completionPercentage,
    });

    logger.info('Stream ended via API', {
      sessionId,
      subscriberId: req.user.userId,
    });

    res.status(200).json({
      status: 'success',
      message: 'Stream session ended successfully',
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Get stream session
   * GET /stream/:sessionId
   */
  async getStreamSession(req: AuthenticatedRequest, res: Response): Promise<void> {
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

    const session = await streamingService.getStreamSession(sessionId);

    // Verify user has access to this session
    if (session.subscriberId !== req.user.userId && session.creatorId !== req.user.userId) {
      res.status(403).json({
        status: 'error',
        code: 'ACCESS_DENIED',
        message: 'You do not have access to this stream session',
        timestamp: new Date().toISOString(),
      });
      return;
    }

    res.status(200).json({
      status: 'success',
      data: session,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Get creator analytics
   * GET /stream/analytics/creator/:creatorId
   */
  async getCreatorAnalytics(req: AuthenticatedRequest, res: Response): Promise<void> {
    if (!req.user || req.user.userType !== 'creator') {
      res.status(403).json({
        status: 'error',
        code: 'ACCESS_DENIED',
        message: 'Only creators can view analytics',
        timestamp: new Date().toISOString(),
      });
      return;
    }

    const { creatorId } = req.params;

    // Verify creator is accessing their own analytics
    if (req.user.userId !== creatorId) {
      res.status(403).json({
        status: 'error',
        code: 'ACCESS_DENIED',
        message: 'You can only view your own analytics',
        timestamp: new Date().toISOString(),
      });
      return;
    }

    const analytics = await streamingService.getCreatorAnalytics(creatorId);

    res.status(200).json({
      status: 'success',
      data: {
        ...analytics,
        totalBytesTransferred: analytics.totalBytesTransferred.toString(),
      },
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Get subscriber history
   * GET /stream/history/subscriber/:subscriberId
   */
  async getSubscriberHistory(req: AuthenticatedRequest, res: Response): Promise<void> {
    if (!req.user || req.user.userType !== 'subscriber') {
      res.status(403).json({
        status: 'error',
        code: 'ACCESS_DENIED',
        message: 'Only subscribers can view history',
        timestamp: new Date().toISOString(),
      });
      return;
    }

    const { subscriberId } = req.params;
    const { limit } = req.query;

    // Verify subscriber is accessing their own history
    if (req.user.userId !== subscriberId) {
      res.status(403).json({
        status: 'error',
        code: 'ACCESS_DENIED',
        message: 'You can only view your own history',
        timestamp: new Date().toISOString(),
      });
      return;
    }

    const history = await streamingService.getSubscriberHistory(
      subscriberId,
      limit ? parseInt(limit as string, 10) : undefined
    );

    res.status(200).json({
      status: 'success',
      data: history.map((h) => ({
        ...h,
        bytesTransferred: h.bytesTransferred.toString(),
      })),
      timestamp: new Date().toISOString(),
    });
  }
}

// Export singleton instance
export const streamingController = new StreamingController();
