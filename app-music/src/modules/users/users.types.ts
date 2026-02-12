/**
 * User management types
 */

/**
 * Creator profile data
 */
export interface CreatorProfileData {
  userId: string;
  displayName: string;
  bio: string | null;
  avatarUrl: string | null;
  genres: string[];
  subscriberCount: number;
  totalStreams: number;
  totalRevenue: number;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Subscriber profile data
 */
export interface SubscriberProfileData {
  userId: string;
  displayName: string;
  bio: string | null;
  avatarUrl: string | null;
  activeAccessCount: number;
  totalStreams: number;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Update creator profile request
 */
export interface UpdateCreatorProfileRequest {
  displayName?: string;
  bio?: string;
  avatarUrl?: string;
  genres?: string[];
}

/**
 * Update subscriber profile request
 */
export interface UpdateSubscriberProfileRequest {
  displayName?: string;
  bio?: string;
  avatarUrl?: string;
}

/**
 * Creator preview for discovery
 */
export interface CreatorPreview {
  userId: string;
  displayName: string;
  bio: string | null;
  avatarUrl: string | null;
  genres: string[];
  subscriberCount: number;
  hasAccess: boolean;
}

/**
 * Subscriber info for creator's subscriber list
 */
export interface SubscriberInfo {
  userId: string;
  displayName: string;
  avatarUrl: string | null;
  grantedAt: Date;
  expiresAt: Date | null;
  isActive: boolean;
}

/**
 * Access grant info for subscriber
 */
export interface AccessGrantInfo {
  creatorId: string;
  creatorName: string;
  creatorAvatar: string | null;
  grantedAt: Date;
  expiresAt: Date | null;
  isActive: boolean;
}

/**
 * Creator search filters
 */
export interface CreatorSearchFilters {
  query?: string;
  genres?: string[];
  sortBy?: 'subscriberCount' | 'totalStreams' | 'displayName';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

/**
 * Paginated creator list
 */
export interface PaginatedCreators {
  creators: CreatorPreview[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}
