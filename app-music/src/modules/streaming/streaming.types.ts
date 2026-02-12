/**
 * Streaming types
 */

/**
 * Stream session data
 */
export interface StreamSessionData {
  id: string;
  subscriberId: string;
  contentId: string;
  creatorId: string;
  startedAt: Date;
  endedAt: Date | null;
  duration: number;
  bytesTransferred: bigint;
  completionPercentage: number;
}

/**
 * Initialize stream request
 */
export interface InitializeStreamRequest {
  subscriberId: string;
  contentId: string;
}

/**
 * Initialize stream result
 */
export interface InitializeStreamResult {
  sessionId: string;
  manifestUrl: string;
  contentTitle: string;
  duration: number;
}

/**
 * End stream request
 */
export interface EndStreamRequest {
  sessionId: string;
  duration: number;
  bytesTransferred: bigint;
  completionPercentage: number;
}

/**
 * HLS segment info
 */
export interface HLSSegmentInfo {
  segmentId: number;
  duration: number;
  url: string;
}

/**
 * HLS manifest data
 */
export interface HLSManifest {
  version: number;
  targetDuration: number;
  mediaSequence: number;
  segments: HLSSegmentInfo[];
  endList: boolean;
}

/**
 * Stream analytics
 */
export interface StreamAnalytics {
  totalStreams: number;
  totalDuration: number;
  totalBytesTransferred: bigint;
  averageCompletionPercentage: number;
  uniqueSubscribers: number;
}
