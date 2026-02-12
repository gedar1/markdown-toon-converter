import { Prisma } from '@prisma/client';
import { prisma } from '../../shared/database/client';
import { NotFoundError, ValidationError, AccessDeniedError } from '../../shared/errors/AppError';
import { validateUUID } from '../../shared/utils/validation';
import { logger } from '../../shared/utils/logger';
import * as fs from 'fs/promises';
import * as path from 'path';
import {
  StreamSessionData,
  InitializeStreamRequest,
  InitializeStreamResult,
  EndStreamRequest,
  HLSManifest,
  HLSSegmentInfo,
  StreamAnalytics,
} from './streaming.types';

export class StreamingService {
  /**
   * Initialize a new stream session
   */
  async initializeStream(request: InitializeStreamRequest): Promise<InitializeStreamResult> {
    const { subscriberId, contentId } = request;

    // Validate IDs
    if (!validateUUID(subscriberId) || !validateUUID(contentId)) {
      throw new ValidationError('Invalid ID format');
    }

    // Verify subscriber exists
    const subscriber = await prisma.user.findUnique({
      where: { id: subscriberId, userType: 'subscriber' },
    });

    if (!subscriber) {
      throw new NotFoundError('Subscriber');
    }

    // Get content
    const content = await prisma.content.findUnique({
      where: { id: contentId },
    });

    if (!content) {
      throw new NotFoundError('Content');
    }

    if (!content.isActive) {
      throw new ValidationError('Content is not available');
    }

    // Verify access
    const hasAccess = await this.verifyAccess(subscriberId, content.creatorId);
    if (!hasAccess) {
      throw new AccessDeniedError('You do not have access to this content');
    }

    // Create stream session
    const session = await prisma.streamSession.create({
      data: {
        subscriberId,
        contentId,
        creatorId: content.creatorId,
        duration: 0,
        bytesTransferred: BigInt(0),
        completionPercentage: 0,
      },
    });

    // Increment play count
    await prisma.content.update({
      where: { id: contentId },
      data: {
        playCount: { increment: 1 },
      },
    });

    // Update subscriber total streams
    await prisma.subscriberProfile.update({
      where: { userId: subscriberId },
      data: {
        totalStreams: { increment: 1 },
      },
    });

    // Update creator total streams
    await prisma.creatorProfile.update({
      where: { userId: content.creatorId },
      data: {
        totalStreams: { increment: 1 },
      },
    });

    logger.info('Stream session initialized', {
      sessionId: session.id,
      subscriberId,
      contentId,
      creatorId: content.creatorId,
    });

    // Generate manifest URL
    const manifestUrl = `/stream/${session.id}/manifest.m3u8`;

    return {
      sessionId: session.id,
      manifestUrl,
      contentTitle: content.title,
      duration: content.duration,
    };
  }

  /**
   * Get HLS manifest for a stream session
   */
  async getStreamManifest(sessionId: string): Promise<HLSManifest> {
    if (!validateUUID(sessionId)) {
      throw new ValidationError('Invalid session ID format');
    }

    // Verify session exists
    const session = await prisma.streamSession.findUnique({
      where: { id: sessionId },
      include: {
        content: true,
      },
    });

    if (!session) {
      throw new NotFoundError('Stream session');
    }

    // Verify access is still valid
    const hasAccess = await this.verifyAccess(session.subscriberId, session.creatorId);
    if (!hasAccess) {
      throw new AccessDeniedError('Access to this content has expired');
    }

    // Generate HLS manifest
    // Note: In production, you would use ffmpeg to segment the audio
    // For MVP, we'll create a simple manifest pointing to the full file
    const content = session.content;
    const segmentDuration = 10; // 10 seconds per segment
    const totalSegments = Math.ceil(content.duration / segmentDuration);

    const segments: HLSSegmentInfo[] = [];
    for (let i = 0; i < totalSegments; i++) {
      const duration = Math.min(segmentDuration, content.duration - i * segmentDuration);
      segments.push({
        segmentId: i,
        duration,
        url: `/stream/${sessionId}/segment/${i}.ts`,
      });
    }

    return {
      version: 3,
      targetDuration: segmentDuration,
      mediaSequence: 0,
      segments,
      endList: true,
    };
  }

  /**
   * Get stream segment
   * Note: This is a simplified version. In production, use ffmpeg for actual segmentation
   */
  async getStreamSegment(
    sessionId: string,
    segmentId: number
  ): Promise<{ filePath: string; mimeType: string }> {
    if (!validateUUID(sessionId)) {
      throw new ValidationError('Invalid session ID format');
    }

    // Verify session exists
    const session = await prisma.streamSession.findUnique({
      where: { id: sessionId },
      include: {
        content: true,
      },
    });

    if (!session) {
      throw new NotFoundError('Stream session');
    }

    // Verify access
    const hasAccess = await this.verifyAccess(session.subscriberId, session.creatorId);
    if (!hasAccess) {
      throw new AccessDeniedError('Access to this content has expired');
    }

    // For MVP, return the full file
    // In production, return the actual segment file
    const content = session.content;

    // Verify file exists
    try {
      await fs.access(content.fileStoragePath);
    } catch {
      throw new NotFoundError('Content file');
    }

    return {
      filePath: content.fileStoragePath,
      mimeType: 'audio/mpeg', // Simplified for MVP
    };
  }

  /**
   * End stream session and record analytics
   */
  async endStream(request: EndStreamRequest): Promise<void> {
    const { sessionId, duration, bytesTransferred, completionPercentage } = request;

    if (!validateUUID(sessionId)) {
      throw new ValidationError('Invalid session ID format');
    }

    // Verify session exists
    const session = await prisma.streamSession.findUnique({
      where: { id: sessionId },
    });

    if (!session) {
      throw new NotFoundError('Stream session');
    }

    if (session.endedAt) {
      throw new ValidationError('Stream session already ended');
    }

    // Update session
    await prisma.streamSession.update({
      where: { id: sessionId },
      data: {
        endedAt: new Date(),
        duration,
        bytesTransferred,
        completionPercentage: Math.min(100, Math.max(0, completionPercentage)),
      },
    });

    logger.info('Stream session ended', {
      sessionId,
      duration,
      bytesTransferred: bytesTransferred.toString(),
      completionPercentage,
    });
  }

  /**
   * Get stream session by ID
   */
  async getStreamSession(sessionId: string): Promise<StreamSessionData> {
    if (!validateUUID(sessionId)) {
      throw new ValidationError('Invalid session ID format');
    }

    const session = await prisma.streamSession.findUnique({
      where: { id: sessionId },
    });

    if (!session) {
      throw new NotFoundError('Stream session');
    }

    return this.mapSessionToData(session);
  }

  /**
   * Get creator's stream analytics
   */
  async getCreatorAnalytics(creatorId: string): Promise<StreamAnalytics> {
    if (!validateUUID(creatorId)) {
      throw new ValidationError('Invalid creator ID format');
    }

    const sessions = await prisma.streamSession.findMany({
      where: { creatorId },
    });

    const totalStreams = sessions.length;
    const totalDuration = sessions.reduce((sum, s) => sum + s.duration, 0);
    const totalBytesTransferred = sessions.reduce((sum, s) => sum + s.bytesTransferred, BigInt(0));
    const averageCompletionPercentage =
      totalStreams > 0
        ? sessions.reduce((sum, s) => sum + s.completionPercentage, 0) / totalStreams
        : 0;

    const uniqueSubscribers = new Set(sessions.map((s) => s.subscriberId)).size;

    return {
      totalStreams,
      totalDuration,
      totalBytesTransferred,
      averageCompletionPercentage,
      uniqueSubscribers,
    };
  }

  /**
   * Get subscriber's stream history
   */
  async getSubscriberHistory(
    subscriberId: string,
    limit: number = 20
  ): Promise<StreamSessionData[]> {
    if (!validateUUID(subscriberId)) {
      throw new ValidationError('Invalid subscriber ID format');
    }

    const sessions = await prisma.streamSession.findMany({
      where: { subscriberId },
      orderBy: { startedAt: 'desc' },
      take: limit,
    });

    return sessions.map((s) => this.mapSessionToData(s));
  }

  /**
   * Verify subscriber has access to creator's content
   */
  private async verifyAccess(subscriberId: string, creatorId: string): Promise<boolean> {
    const grant = await prisma.accessGrant.findFirst({
      where: {
        subscriberId,
        creatorId,
        isActive: true,
      },
    });

    if (!grant) {
      return false;
    }

    // Check expiration
    if (grant.expiresAt && grant.expiresAt < new Date()) {
      return false;
    }

    return true;
  }

  /**
   * Map Prisma session to StreamSessionData
   */
  private mapSessionToData(session: any): StreamSessionData {
    return {
      id: session.id,
      subscriberId: session.subscriberId,
      contentId: session.contentId,
      creatorId: session.creatorId,
      startedAt: session.startedAt,
      endedAt: session.endedAt,
      duration: session.duration,
      bytesTransferred: session.bytesTransferred,
      completionPercentage: session.completionPercentage,
    };
  }

  /**
   * Generate M3U8 manifest content
   */
  generateM3U8Content(manifest: HLSManifest): string {
    let content = '#EXTM3U\n';
    content += `#EXT-X-VERSION:${manifest.version}\n`;
    content += `#EXT-X-TARGETDURATION:${manifest.targetDuration}\n`;
    content += `#EXT-X-MEDIA-SEQUENCE:${manifest.mediaSequence}\n\n`;

    for (const segment of manifest.segments) {
      content += `#EXTINF:${segment.duration.toFixed(3)},\n`;
      content += `${segment.url}\n`;
    }

    if (manifest.endList) {
      content += '#EXT-X-ENDLIST\n';
    }

    return content;
  }
}

// Export singleton instance
export const streamingService = new StreamingService();
