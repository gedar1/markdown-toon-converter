import { IPlaylistRepository } from '../repositories/IPlaylistRepository';
import { IContentRepository } from '../repositories/IContentRepository';
import { ValidationError, NotFoundError } from '../../../shared/errors/AppError';
import { validateUUID } from '../../../shared/utils/validation';
import { logger } from '../../../shared/utils/logger';

/**
 * Add content to playlist input
 */
export interface AddContentToPlaylistInput {
  playlistId: string;
  contentId: string;
  position?: number;
}

/**
 * Add Content to Playlist Use Case
 *
 * EXTRACCIÓN: Lógica para agregar contenido a playlist
 * UBICACIÓN: domain/content/use-cases/
 * NOTA: Este use case necesita AMBOS repositories (Playlist y Content)
 */
export class AddContentToPlaylist {
  constructor(
    readonly playlistRepository: IPlaylistRepository,
    readonly contentRepository: IContentRepository
  ) {}

  async execute(input: AddContentToPlaylistInput): Promise<void> {
    const { playlistId, contentId, position } = input;

    // Validate IDs
    if (!validateUUID(playlistId) || !validateUUID(contentId)) {
      throw new ValidationError('Invalid ID format');
    }

    // Verify playlist exists
    const playlist = await this.playlistRepository.findById(playlistId);
    if (!playlist) {
      throw new NotFoundError('Playlist');
    }

    // Verify content exists
    const content = await this.contentRepository.findById(contentId);
    if (!content) {
      throw new NotFoundError('Content');
    }

    // Verify content belongs to same creator
    if (playlist.creatorId !== content.creatorId) {
      throw new ValidationError('Content must belong to the same creator as the playlist');
    }

    // Check if content already in playlist
    const alreadyExists = await this.playlistRepository.hasContent(playlistId, contentId);
    if (alreadyExists) {
      throw new ValidationError('Content is already in this playlist');
    }

    // Get next position if not provided
    const finalPosition = position ?? (await this.playlistRepository.getNextPosition(playlistId));

    // Add content to playlist
    await this.playlistRepository.addContent(playlistId, contentId, finalPosition);

    logger.info('Content added to playlist', {
      playlistId,
      contentId,
      position: finalPosition,
    });
  }
}
