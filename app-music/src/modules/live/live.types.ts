/**
 * Live streaming types
 */

export type LiveStreamStatus = 'scheduled' | 'live' | 'ended' | 'cancelled';

export interface LiveStream {
  id: string;
  creatorId: string;
  title: string;
  description: string | null;
  scheduledFor: Date | null;
  status: LiveStreamStatus;
  streamKey: string;
  rtmpUrl: string;
  playbackUrl: string;
  viewerCount: number;
  maxViewers: number;
  startedAt: Date | null;
  endedAt: Date | null;
  duration: number; // in seconds
  recordingEnabled: boolean;
  recordingUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateLiveStreamRequest {
  title: string;
  description?: string;
  scheduledFor?: Date;
  recordingEnabled?: boolean;
}

export interface UpdateLiveStreamRequest {
  title?: string;
  description?: string;
  scheduledFor?: Date;
  status?: LiveStreamStatus;
}

export interface LiveStreamStats {
  streamId: string;
  viewerCount: number;
  peakViewers: number;
  totalViews: number;
  averageWatchTime: number;
  startedAt: Date | null;
  endedAt: Date | null;
}

export interface StreamViewer {
  id: string;
  streamId: string;
  subscriberId: string;
  joinedAt: Date;
  leftAt: Date | null;
  watchTime: number;
}

// AWS IVS specific types (can be replaced with other providers)
export interface IVSChannelConfig {
  channelArn: string;
  ingestEndpoint: string;
  playbackUrl: string;
  streamKey: string;
}
