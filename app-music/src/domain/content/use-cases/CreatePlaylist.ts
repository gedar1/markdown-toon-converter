import { IPlaylistRepository, Playlist } from '../repositories/IPlaylistRepository';
import { ValidationError } from '../../../shared/errors/AppError';
import { validateUUID } from '../../../shared/utils/validation';
import { logger } from '../../../shared/utils/logger';

/**
 * Create playlist input
 */
export interface CreatePlaylistInput {
  creatorId: string;
  name: string;
  description?: string;
  coverArtUrl?: string;
}

/**
 * Create playlist output
 */
export interface CreatePlaylistOutput extends Playlist {
  contentCount: number;
}

/**
 * Create Playlist Use Case
 *
 * EXTRACCIÓN: Lógica para crear playlists
 * UBICACIÓN: domain/content/use-cases/
 */
export class CreatePlaylist {
  constructor(readonly playlistRepository: IPlaylistRepository) {}

  async execute(input: CreatePlaylistInput): Promise<CreatePlaylistOutput> {
    const { creatorId, name, description, coverArtUrl } = input;

    // Validate creator ID
    if (!validateUUID(creatorId)) {
      throw new ValidationError('Invalid creator ID format');
    }

    // Create playlist
    const playlist = await this.playlistRepository.create({
      creatorId,
      name: name.trim(),
      description: description?.trim() || null,
      coverArtUrl: coverArtUrl || null,
    });

    logger.info('Playlist created', {
      playlistId: playlist.id,
      creatorId,
      name: playlist.name,
    });

    return {
      ...playlist,
      contentCount: 0,
    };
  }
}
