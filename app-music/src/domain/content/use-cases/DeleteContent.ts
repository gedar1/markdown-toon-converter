import { IContentRepository } from '../repositories/IContentRepository';
import { IFileStorageService } from '../repositories/IFileStorageService';
import { ValidationError, NotFoundError, AccessDeniedError } from '../../../shared/errors/AppError';
import { validateUUID } from '../../../shared/utils/validation';
import { logger } from '../../../shared/utils/logger';

/**
 * Delete content input
 */
export interface DeleteContentInput {
  contentId: string;
  creatorId: string;
}

/**
 * Delete Content Use Case
 *
 * EXTRACCIÓN: Lógica para eliminar contenido (archivo + registro)
 * UBICACIÓN: domain/content/use-cases/
 */
export class DeleteContent {
  constructor(
    readonly contentRepository: IContentRepository,
    readonly fileStorage: IFileStorageService
  ) {}

  async execute(input: DeleteContentInput): Promise<void> {
    const { contentId, creatorId } = input;

    // Validate IDs
    if (!validateUUID(contentId) || !validateUUID(creatorId)) {
      throw new ValidationError('Invalid ID format');
    }

    // Verify content exists
    const content = await this.contentRepository.findById(contentId);

    if (!content) {
      throw new NotFoundError('Content');
    }

    // Verify ownership
    if (content.creatorId !== creatorId) {
      throw new AccessDeniedError('You can only delete your own content');
    }

    // Delete file from storage
    try {
      await this.fileStorage.deleteAudioFile(content.fileStoragePath);
    } catch (error) {
      logger.warn('Failed to delete content file', {
        contentId,
        filePath: content.fileStoragePath,
        error,
      });
    }

    // Delete content record
    await this.contentRepository.delete(contentId);

    logger.info('Content deleted', { contentId, creatorId });
  }
}
