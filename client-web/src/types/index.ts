/**
 * User types
 */
export type UserType = "creator" | "subscriber";

export interface User {
  id: string;
  email: string;
  userType: UserType;
  createdAt: string;
  updatedAt: string;
}

export interface CreatorProfile {
  id: string;
  userId: string;
  displayName: string;
  bio: string | null;
  avatarUrl: string | null;
  genre: string | null;
  subscriberCount: number;
  totalStreams: number;
  createdAt: string;
  updatedAt: string;
}

export interface SubscriberProfile {
  id: string;
  userId: string;
  displayName: string;
  avatarUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

/**
 * Auth types
 */
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  userType: UserType;
  displayName: string;
}

export interface AuthResponse {
  status: string;
  data: {
    user: User;
    profile: CreatorProfile | SubscriberProfile;
    token: string;
  };
}

/**
 * Content types
 */
export interface Content {
  id: string;
  creatorId: string;
  title: string;
  description: string | null;
  audioUrl: string;
  coverUrl: string | null;
  duration: number | null;
  format: string;
  fileSize: number;
  playCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Playlist {
  id: string;
  creatorId: string;
  title: string;
  description: string | null;
  coverUrl: string | null;
  isPublic: boolean;
  contentCount: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * Access types
 */
export interface AccessCode {
  id: string;
  code: string;
  creatorId: string;
  price: number;
  currency: string;
  durationDays: number;
  maxUses: number;
  currentUses: number;
  isActive: boolean;
  expiresAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AccessGrant {
  id: string;
  subscriberId: string;
  creatorId: string;
  accessCodeId: string;
  grantedAt: string;
  expiresAt: string;
  isActive: boolean;
}

/**
 * Streaming types
 */
export interface StreamSession {
  id: string;
  subscriberId: string;
  contentId: string;
  startedAt: string;
  endedAt: string | null;
  duration: number;
  bytesTransferred: number;
  completionPercentage: number;
}

/**
 * Live Streaming types
 */
export type LiveStreamStatus = "scheduled" | "live" | "ended" | "cancelled";

export interface LiveStream {
  id: string;
  creatorId: string;
  title: string;
  description: string | null;
  scheduledFor: string | null;
  status: LiveStreamStatus;
  streamKey: string;
  rtmpUrl: string;
  playbackUrl: string;
  viewerCount: number;
  maxViewers: number;
  startedAt: string | null;
  endedAt: string | null;
  duration: number;
  recordingEnabled: boolean;
  recordingUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface StreamStats {
  streamId: string;
  viewerCount: number;
  peakViewers: number;
  totalViews: number;
  averageWatchTime: number;
  startedAt: string | null;
  endedAt: string | null;
}

/**
 * API Response types
 */
export interface ApiResponse<T> {
  status: string;
  data: T;
  message?: string;
}

export interface ApiError {
  status: string;
  message: string;
  errors?: Record<string, string[]>;
}

/**
 * Pagination types
 */
export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
