/**
 * Content management types
 */

/**
 * Content data
 */
export interface ContentData {
  id: string;
  creatorId: string;
  title: string;
  description: string | null;
  genre: string;
  duration: number;
  coverArtUrl: string | null;
  tags: string[];
  fileStoragePath: string;
  streamUrl: string;
  uploadedAt: Date;
  playCount: number;
  isActive: boolean;
}

/**
 * Upload content request
 */
export interface UploadContentRequest {
  creatorId: string;
  title: string;
  description?: string;
  genre: string;
  duration: number;
  coverArtUrl?: string;
  tags?: string[];
  file: {
    originalName: string;
    mimeType: string;
    size: number;
    buffer: Buffer;
  };
}

/**
 * Update content request
 */
export interface UpdateContentRequest {
  title?: string;
  description?: string;
  genre?: string;
  coverArtUrl?: string;
  tags?: string[];
  isActive?: boolean;
}

/**
 * Content filters
 */
export interface ContentFilters {
  creatorId?: string;
  genre?: string;
  tags?: string[];
  isActive?: boolean;
  sortBy?: 'uploadedAt' | 'playCount' | 'title';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

/**
 * Paginated content list
 */
export interface PaginatedContent {
  content: ContentData[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

/**
 * Playlist data
 */
export interface PlaylistData {
  id: string;
  creatorId: string;
  name: string;
  description: string | null;
  coverArtUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
  contentCount: number;
}

/**
 * Create playlist request
 */
export interface CreatePlaylistRequest {
  creatorId: string;
  name: string;
  description?: string;
  coverArtUrl?: string;
}

/**
 * Update playlist request
 */
export interface UpdatePlaylistRequest {
  name?: string;
  description?: string;
  coverArtUrl?: string;
  isActive?: boolean;
}

/**
 * Add content to playlist request
 */
export interface AddContentToPlaylistRequest {
  playlistId: string;
  contentId: string;
  position?: number;
}

/**
 * Playlist with content
 */
export interface PlaylistWithContent extends PlaylistData {
  content: ContentData[];
}

/**
 * Audio format validation
 */
export const ALLOWED_AUDIO_FORMATS = ['audio/mpeg', 'audio/wav', 'audio/flac', 'audio/mp3'];
export const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB
