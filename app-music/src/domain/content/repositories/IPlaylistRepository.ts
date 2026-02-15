/**
 * Playlist entity
 */
export interface Playlist {
  id: string;
  creatorId: string;
  name: string;
  description: string | null;
  coverArtUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
}

/**
 * Playlist with content count
 */
export interface PlaylistWithCount extends Playlist {
  contentCount: number;
}

/**
 * Playlist content association
 */
export interface PlaylistContent {
  playlistId: string;
  contentId: string;
  position: number;
  addedAt: Date;
}

/**
 * Repository interface for Playlist operations (PORT)
 *
 * EXTRACCIÓN: Todas las operaciones de base de datos relacionadas con Playlists
 * UBICACIÓN: domain/content/repositories/ (Puerto - Interface)
 */
export interface IPlaylistRepository {
  /**
   * Create new playlist
   */
  create(data: {
    creatorId: string;
    name: string;
    description: string | null;
    coverArtUrl: string | null;
  }): Promise<Playlist>;

  /**
   * Find playlist by ID
   */
  findById(playlistId: string): Promise<Playlist | null>;

  /**
   * Update playlist
   */
  update(playlistId: string, data: Partial<Playlist>): Promise<Playlist>;

  /**
   * Delete playlist
   */
  delete(playlistId: string): Promise<void>;

  /**
   * Get creator's playlists
   */
  getCreatorPlaylists(creatorId: string): Promise<PlaylistWithCount[]>;

  /**
   * Get playlist content count
   */
  getContentCount(playlistId: string): Promise<number>;

  /**
   * Add content to playlist
   */
  addContent(playlistId: string, contentId: string, position: number): Promise<void>;

  /**
   * Remove content from playlist
   */
  removeContent(playlistId: string, contentId: string): Promise<void>;

  /**
   * Check if content exists in playlist
   */
  hasContent(playlistId: string, contentId: string): Promise<boolean>;

  /**
   * Get next position in playlist
   */
  getNextPosition(playlistId: string): Promise<number>;

  /**
   * Get playlist with all content
   */
  getWithContent(playlistId: string): Promise<{
    playlist: Playlist;
    content: Array<{ content: any; position: number }>;
  } | null>;
}
