/**
 * Content entity
 */
export interface Content {
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
 * Content filters for queries
 */
export interface ContentFilters {
  genre?: string;
  tags?: string[];
  isActive?: boolean;
  sortBy?: 'playCount' | 'title' | 'uploadedAt';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

/**
 * Paginated content result
 */
export interface PaginatedContent {
  content: Content[];
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
 * Repository interface for Content operations (PORT)
 *
 * EXTRACCIÓN: Todas las operaciones de base de datos relacionadas con Content
 * UBICACIÓN: domain/content/repositories/ (Puerto - Interface)
 */
export interface IContentRepository {
  /**
   * Create new content
   */
  create(data: {
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
  }): Promise<Content>;

  /**
   * Find content by ID
   */
  findById(contentId: string): Promise<Content | null>;

  /**
   * Update content
   */
  update(contentId: string, data: Partial<Content>): Promise<Content>;

  /**
   * Delete content
   */
  delete(contentId: string): Promise<void>;

  /**
   * Get creator's library with filters
   */
  getCreatorLibrary(creatorId: string, filters: ContentFilters): Promise<PaginatedContent>;

  /**
   * Increment play count
   */
  incrementPlayCount(contentId: string): Promise<void>;
}
