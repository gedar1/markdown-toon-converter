/**
 * Notification Types
 * 
 * Defines the event types and payloads for real-time notifications
 * sent via Socket.IO.
 */

// ============================================
// Server → Client Events
// ============================================

export interface StreamStartedPayload {
  streamId: string;
  creatorId: string;
  creatorName: string;
  title: string;
  description?: string;
  playbackUrl: string;
  startedAt: string;
}

export interface StreamEndedPayload {
  streamId: string;
  creatorId: string;
  creatorName: string;
  title: string;
  endedAt: string;
  duration: number;
}

export interface ViewerCountPayload {
  streamId: string;
  viewerCount: number;
  maxViewers: number;
}

export interface ServerToClientEvents {
  'stream:started': (payload: StreamStartedPayload) => void;
  'stream:ended': (payload: StreamEndedPayload) => void;
  'viewer:count:updated': (payload: ViewerCountPayload) => void;
  'error': (payload: { message: string }) => void;
}

// ============================================
// Client → Server Events
// ============================================

export interface ClientToServerEvents {
  // Client subscribes to a specific stream's updates (viewer count, etc.)
  'stream:watch': (streamId: string) => void;
  // Client stops watching a specific stream's updates
  'stream:unwatch': (streamId: string) => void;
}

// ============================================
// Socket Data (attached to each connection)
// ============================================

export interface SocketData {
  userId: string;
  userType: 'creator' | 'subscriber';
  displayName: string;
}
