import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { prisma } from '../../shared/database/client';
import { logger } from '../../shared/utils/logger';
import type {
  ServerToClientEvents,
  ClientToServerEvents,
  SocketData,
  StreamStartedPayload,
  StreamEndedPayload,
  ViewerCountPayload,
} from './notification.types';

type TypedIO = Server<ClientToServerEvents, ServerToClientEvents, Record<string, never>, SocketData>;
type TypedSocket = Socket<ClientToServerEvents, ServerToClientEvents, Record<string, never>, SocketData>;

/**
 * Notification Service
 * 
 * Manages real-time notifications using Socket.IO.
 * Subscribers automatically join rooms for the creators they have active access to.
 * When a creator starts/ends a stream, all subscribers with access are notified.
 */
class NotificationService {
  private io: TypedIO | null = null;

  /**
   * Initialize Socket.IO on the given HTTP server
   */
  initialize(httpServer: HttpServer): void {
    const corsOrigins = (process.env.CORS_ORIGIN || '*').split(',').map((o) => o.trim());

    this.io = new Server<ClientToServerEvents, ServerToClientEvents, Record<string, never>, SocketData>(httpServer, {
      cors: {
        origin: corsOrigins,
        credentials: true,
      },
      path: '/socket.io',
    });

    // JWT Authentication middleware
    this.io.use(async (socket: TypedSocket, next) => {
      try {
        const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.replace('Bearer ', '');

        if (!token) {
          return next(new Error('Authentication required'));
        }

        const secret = process.env.JWT_SECRET;
        if (!secret) {
          return next(new Error('Server configuration error'));
        }

        const decoded = jwt.verify(token, secret) as { userId: string; userType: string; displayName?: string };

        socket.data.userId = decoded.userId;
        socket.data.userType = decoded.userType as 'creator' | 'subscriber';
        socket.data.displayName = decoded.displayName || 'User';

        next();
      } catch (error) {
        logger.warn('Socket.IO auth failed', { error: (error as Error).message });
        next(new Error('Invalid or expired token'));
      }
    });

    // Connection handler
    this.io.on('connection', async (socket: TypedSocket) => {
      const { userId, userType, displayName } = socket.data;

      logger.info('Socket.IO client connected', { userId, userType, displayName });

      // Subscribers auto-join rooms for creators they have access to
      if (userType === 'subscriber') {
        await this.joinCreatorRooms(socket);
      }

      // Creators join their own room to receive viewer updates
      if (userType === 'creator') {
        socket.join(`creator:${userId}`);
      }

      // Handle watching a specific stream (for viewer count updates)
      socket.on('stream:watch', (streamId: string) => {
        socket.join(`stream:${streamId}`);
        logger.debug('Socket joined stream room', { userId, streamId });
      });

      socket.on('stream:unwatch', (streamId: string) => {
        socket.leave(`stream:${streamId}`);
        logger.debug('Socket left stream room', { userId, streamId });
      });

      socket.on('disconnect', (reason) => {
        logger.info('Socket.IO client disconnected', { userId, reason });
      });
    });

    logger.info('Socket.IO notification service initialized');
  }

  /**
   * Have a subscriber socket join rooms for all creators they have active access to
   */
  private async joinCreatorRooms(socket: TypedSocket): Promise<void> {
    try {
      const grants = await prisma.accessGrant.findMany({
        where: {
          subscriberId: socket.data.userId,
          isActive: true,
          OR: [
            { expiresAt: null },
            { expiresAt: { gt: new Date() } },
          ],
        },
        select: { creatorId: true },
      });

      for (const grant of grants) {
        socket.join(`creator:${grant.creatorId}`);
      }

      logger.debug('Subscriber joined creator rooms', {
        userId: socket.data.userId,
        roomCount: grants.length,
      });
    } catch (error) {
      logger.error('Failed to join creator rooms', { error: (error as Error).message });
    }
  }

  /**
   * Get the Socket.IO server instance
   */
  getIO(): TypedIO | null {
    return this.io;
  }

  // ============================================
  // Notification Methods
  // ============================================

  /**
   * Notify subscribers that a creator started a live stream
   */
  notifyStreamStarted(stream: {
    id: string;
    creatorId: string;
    creatorName?: string | null;
    title: string;
    description?: string | null;
    playbackUrl: string;
    startedAt?: Date | string | null;
  }): void {
    if (!this.io) return;

    const payload: StreamStartedPayload = {
      streamId: stream.id,
      creatorId: stream.creatorId,
      creatorName: stream.creatorName || 'Creator',
      title: stream.title,
      description: stream.description || undefined,
      playbackUrl: stream.playbackUrl,
      startedAt: (stream.startedAt ? new Date(stream.startedAt).toISOString() : new Date().toISOString()),
    };

    // Emit to all subscribers in the creator's room
    this.io.to(`creator:${stream.creatorId}`).emit('stream:started', payload);

    logger.info('Notification: stream:started emitted', {
      streamId: stream.id,
      creatorId: stream.creatorId,
      room: `creator:${stream.creatorId}`,
    });
  }

  /**
   * Notify subscribers that a creator ended a live stream
   */
  notifyStreamEnded(stream: {
    id: string;
    creatorId: string;
    creatorName?: string | null;
    title: string;
    endedAt?: Date | string | null;
    duration?: number | null;
  }): void {
    if (!this.io) return;

    const payload: StreamEndedPayload = {
      streamId: stream.id,
      creatorId: stream.creatorId,
      creatorName: stream.creatorName || 'Creator',
      title: stream.title,
      endedAt: (stream.endedAt ? new Date(stream.endedAt).toISOString() : new Date().toISOString()),
      duration: stream.duration || 0,
    };

    this.io.to(`creator:${stream.creatorId}`).emit('stream:ended', payload);

    logger.info('Notification: stream:ended emitted', {
      streamId: stream.id,
      creatorId: stream.creatorId,
    });
  }

  /**
   * Notify viewers of a stream that the viewer count has changed
   */
  notifyViewerCountUpdated(streamId: string, viewerCount: number, maxViewers: number): void {
    if (!this.io) return;

    const payload: ViewerCountPayload = {
      streamId,
      viewerCount,
      maxViewers,
    };

    this.io.to(`stream:${streamId}`).emit('viewer:count:updated', payload);
  }
}

// Singleton instance
export const notificationService = new NotificationService();

/**
 * Helper to initialize Socket.IO from server.ts
 */
export function initializeSocketIO(httpServer: HttpServer): void {
  notificationService.initialize(httpServer);
}
