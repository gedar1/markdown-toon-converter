import { prisma } from '../../shared/database/client';
import { NotFoundError, AccessDeniedError, ValidationError } from '../../shared/errors/AppError';
import { generateSecureToken } from '../../shared/utils/crypto';
import type {
  LiveStream,
  CreateLiveStreamRequest,
  UpdateLiveStreamRequest,
  LiveStreamStats,
  StreamViewer,
} from './live.types';

/**
 * Live Streaming Service
 *
 * This service manages live streaming sessions for creators.
 * It integrates with AWS IVS (or similar service) for actual streaming infrastructure.
 *
 * Note: You'll need to implement the actual AWS IVS integration or use another provider.
 */
class LiveStreamingService {
  /**
   * Create a new live stream session
   */
  async createLiveStream(creatorId: string, data: CreateLiveStreamRequest): Promise<LiveStream> {
    // Validate creator exists
    const creator = await prisma.creatorProfile.findUnique({
      where: { id: creatorId },
    });

    if (!creator) {
      throw new NotFoundError('Creator not found');
    }

    // Generate secure stream key
    const streamKey = generateSecureToken();

    // In production, you would call AWS IVS API here to create a channel
    // For now, we'll use mock URLs
    const rtmpUrl = `rtmp://your-streaming-server.com/live`;
    const playbackUrl = `https://your-cdn.com/live/${streamKey}/index.m3u8`;

    // Create stream in database
    const stream = await prisma.liveStream.create({
      data: {
        creatorId,
        title: data.title,
        description: data.description || null,
        scheduledFor: data.scheduledFor || null,
        status: 'scheduled',
        streamKey,
        rtmpUrl,
        playbackUrl,
        viewerCount: 0,
        maxViewers: 0,
        recordingEnabled: data.recordingEnabled || false,
      },
    });

    return this.mapStreamToData(stream);
  }

  /**
   * Get live stream by ID
   */
  async getLiveStream(streamId: string): Promise<LiveStream> {
    const stream = await prisma.liveStream.findUnique({
      where: { id: streamId },
    });

    if (!stream) {
      throw new NotFoundError('Live stream not found');
    }

    return this.mapStreamToData(stream);
  }

  /**
   * Get all streams for a creator
   */
  async getCreatorStreams(creatorId: string, status?: string): Promise<LiveStream[]> {
    const where: any = { creatorId };

    if (status) {
      where.status = status;
    }

    const streams = await prisma.liveStream.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    return streams.map((s) => this.mapStreamToData(s));
  }

  /**
   * Get active (live) streams
   */
  async getActiveStreams(): Promise<LiveStream[]> {
    const streams = await prisma.liveStream.findMany({
      where: { status: 'live' },
      orderBy: { startedAt: 'desc' },
      include: {
        creator: {
          select: {
            id: true,
            displayName: true,
            avatarUrl: true,
            genre: true,
          },
        },
      },
    });

    return streams.map((s) => this.mapStreamToData(s));
  }

  /**
   * Update live stream
   */
  async updateLiveStream(
    streamId: string,
    creatorId: string,
    data: UpdateLiveStreamRequest
  ): Promise<LiveStream> {
    const stream = await prisma.liveStream.findUnique({
      where: { id: streamId },
    });

    if (!stream) {
      throw new NotFoundError('Live stream not found');
    }

    if (stream.creatorId !== creatorId) {
      throw new AccessDeniedError('You do not have permission to update this stream');
    }

    // Don't allow updates if stream is live
    if (stream.status === 'live' && data.status !== 'ended') {
      throw new ValidationError('Cannot update stream while it is live');
    }

    const updated = await prisma.liveStream.update({
      where: { id: streamId },
      data: {
        title: data.title,
        description: data.description,
        scheduledFor: data.scheduledFor,
        status: data.status,
      },
    });

    return this.mapStreamToData(updated);
  }

  /**
   * Start a live stream (called when creator starts streaming)
   */
  async startStream(streamKey: string): Promise<LiveStream> {
    const stream = await prisma.liveStream.findFirst({
      where: { streamKey },
    });

    if (!stream) {
      throw new NotFoundError('Stream not found');
    }

    if (stream.status === 'live') {
      return this.mapStreamToData(stream);
    }

    const updated = await prisma.liveStream.update({
      where: { id: stream.id },
      data: {
        status: 'live',
        startedAt: new Date(),
      },
    });

    // TODO: Send notifications to subscribers

    return this.mapStreamToData(updated);
  }

  /**
   * End a live stream
   */
  async endStream(streamId: string, creatorId: string): Promise<LiveStream> {
    const stream = await prisma.liveStream.findUnique({
      where: { id: streamId },
    });

    if (!stream) {
      throw new NotFoundError('Live stream not found');
    }

    if (stream.creatorId !== creatorId) {
      throw new AccessDeniedError('You do not have permission to end this stream');
    }

    const endedAt = new Date();
    const duration = stream.startedAt
      ? Math.floor((endedAt.getTime() - stream.startedAt.getTime()) / 1000)
      : 0;

    const updated = await prisma.liveStream.update({
      where: { id: streamId },
      data: {
        status: 'ended',
        endedAt,
        duration,
      },
    });

    // End all active viewer sessions
    await prisma.streamViewer.updateMany({
      where: {
        streamId,
        leftAt: null,
      },
      data: {
        leftAt: endedAt,
      },
    });

    return this.mapStreamToData(updated);
  }

  /**
   * Validate access to stream (check if subscriber has access)
   */
  async validateStreamAccess(streamId: string, subscriberId: string): Promise<boolean> {
    const stream = await prisma.liveStream.findUnique({
      where: { id: streamId },
    });

    if (!stream) {
      throw new NotFoundError('Stream not found');
    }

    // Check if subscriber has active access grant to this creator
    const accessGrant = await prisma.accessGrant.findFirst({
      where: {
        subscriberId,
        creatorId: stream.creatorId,
        isActive: true,
        expiresAt: {
          gt: new Date(),
        },
      },
    });

    return !!accessGrant;
  }

  /**
   * Join stream as viewer
   */
  async joinStream(streamId: string, subscriberId: string): Promise<StreamViewer> {
    // Validate access
    const hasAccess = await this.validateStreamAccess(streamId, subscriberId);

    if (!hasAccess) {
      throw new AccessDeniedError('You do not have access to this stream');
    }

    // Check if already viewing
    const existing = await prisma.streamViewer.findFirst({
      where: {
        streamId,
        subscriberId,
        leftAt: null,
      },
    });

    if (existing) {
      return existing;
    }

    // Create viewer session
    const viewer = await prisma.streamViewer.create({
      data: {
        streamId,
        subscriberId,
        joinedAt: new Date(),
      },
    });

    // Update viewer count
    await this.updateViewerCount(streamId);

    return viewer;
  }

  /**
   * Leave stream
   */
  async leaveStream(streamId: string, subscriberId: string): Promise<void> {
    const viewer = await prisma.streamViewer.findFirst({
      where: {
        streamId,
        subscriberId,
        leftAt: null,
      },
    });

    if (!viewer) {
      return;
    }

    const leftAt = new Date();
    const watchTime = Math.floor((leftAt.getTime() - viewer.joinedAt.getTime()) / 1000);

    await prisma.streamViewer.update({
      where: { id: viewer.id },
      data: {
        leftAt,
        watchTime,
      },
    });

    // Update viewer count
    await this.updateViewerCount(streamId);
  }

  /**
   * Update viewer count for a stream
   */
  private async updateViewerCount(streamId: string): Promise<void> {
    const activeViewers = await prisma.streamViewer.count({
      where: {
        streamId,
        leftAt: null,
      },
    });

    const stream = await prisma.liveStream.findUnique({
      where: { id: streamId },
    });

    if (stream) {
      const maxViewers = Math.max(stream.maxViewers, activeViewers);

      await prisma.liveStream.update({
        where: { id: streamId },
        data: {
          viewerCount: activeViewers,
          maxViewers,
        },
      });
    }
  }

  /**
   * Get stream statistics
   */
  async getStreamStats(streamId: string): Promise<LiveStreamStats> {
    const stream = await prisma.liveStream.findUnique({
      where: { id: streamId },
    });

    if (!stream) {
      throw new NotFoundError('Stream not found');
    }

    const viewers = await prisma.streamViewer.findMany({
      where: { streamId },
    });

    const totalViews = viewers.length;
    const averageWatchTime =
      totalViews > 0 ? viewers.reduce((sum, v) => sum + v.watchTime, 0) / totalViews : 0;

    return {
      streamId,
      viewerCount: stream.viewerCount,
      peakViewers: stream.maxViewers,
      totalViews,
      averageWatchTime,
      startedAt: stream.startedAt,
      endedAt: stream.endedAt,
    };
  }

  /**
   * Delete a stream
   */
  async deleteStream(streamId: string, creatorId: string): Promise<void> {
    const stream = await prisma.liveStream.findUnique({
      where: { id: streamId },
    });

    if (!stream) {
      throw new NotFoundError('Stream not found');
    }

    if (stream.creatorId !== creatorId) {
      throw new AccessDeniedError('You do not have permission to delete this stream');
    }

    if (stream.status === 'live') {
      throw new ValidationError('Cannot delete a live stream');
    }

    // Delete viewer sessions
    await prisma.streamViewer.deleteMany({
      where: { streamId },
    });

    // Delete stream
    await prisma.liveStream.delete({
      where: { id: streamId },
    });
  }

  /**
   * Map Prisma model to LiveStream type
   */
  private mapStreamToData(stream: any): LiveStream {
    return {
      id: stream.id,
      creatorId: stream.creatorId,
      title: stream.title,
      description: stream.description,
      scheduledFor: stream.scheduledFor,
      status: stream.status,
      streamKey: stream.streamKey,
      rtmpUrl: stream.rtmpUrl,
      playbackUrl: stream.playbackUrl,
      viewerCount: stream.viewerCount,
      maxViewers: stream.maxViewers,
      startedAt: stream.startedAt,
      endedAt: stream.endedAt,
      duration: stream.duration,
      recordingEnabled: stream.recordingEnabled,
      recordingUrl: stream.recordingUrl,
      createdAt: stream.createdAt,
      updatedAt: stream.updatedAt,
    };
  }
}

export const liveStreamingService = new LiveStreamingService();
