import { IContentRepository } from '../repositories/IContentRepository';
import { IFileStorageService, FileData } from '../repositories/IFileStorageService';
import { ValidationError } from '../../../shared/errors/AppError';
import {
  validateUUID,
  validateAudioFormat,
  validateFileSize,
} from '../../../shared/utils/validation';
import { logger } from '../../../shared/utils/logger';
import * as crypto from 'node:crypto';

/**
 * Upload content input
 *
 * EXTRACCIÓN: Parámetros necesarios para subir contenido
 * UBICACIÓN: domain/content/use-cases/ (Use Case)
 */
export interface UploadContentInput {
  creatorId: string;
  title: string;
  description?: string;
  genre: string;
  duration: number;
  coverArtUrl?: string;
  tags?: string[];
  file: FileData;
}

/**
 * Upload content output
 */
export interface UploadContentOutput {
  id: string;
  creatorId: string;
  title: string;
  description: string | null;
  genre: string;
  duration: number;
  coverArtUrl: string | null;
  tags: string[];
  streamUrl: string;
  uploadedAt: Date;
  playCount: number;
  isActive: boolean;
}

const ALLOWED_AUDIO_FORMATS = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/flac'];
const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB

/**
 * Upload Content Use Case
 *
 * EXTRACCIÓN: Lógica de negocio para subir contenido
 * UBICACIÓN: domain/content/use-cases/ (Use Case - Lógica pura)
 * POR QUÉ: Separa la lógica de negocio de la infraestructura
 */
export class UploadContent {
  constructor(
    readonly contentRepository: IContentRepository,
    readonly fileStorage: IFileStorageService
  ) {}

  async execute(input: UploadContentInput): Promise<UploadContentOutput> {
    const { creatorId, title, description, genre, duration, coverArtUrl, tags, file } = input;

    // Validate creator ID
    if (!validateUUID(creatorId)) {
      throw new ValidationError('Invalid creator ID format');
    }

    // Validate file format
    if (!validateAudioFormat(file.mimeType)) {
      throw new ValidationError(
        `Invalid audio format. Allowed formats: ${ALLOWED_AUDIO_FORMATS.join(', ')}`
      );
    }

    // Validate file size
    if (!validateFileSize(file.size, MAX_FILE_SIZE)) {
      throw new ValidationError(`File size exceeds maximum allowed size of ${MAX_FILE_SIZE} bytes`);
    }

    // Generate unique content ID
    const contentId = crypto.randomUUID();

    // Save file to storage
    const { filePath, streamUrl } = await this.fileStorage.saveAudioFile(
      creatorId,
      contentId,
      file
    );

    // Create content record
    const content = await this.contentRepository.create({
      id: contentId,
      creatorId,
      title: title.trim(),
      description: description?.trim() || null,
      genre: genre.trim(),
      duration,
      coverArtUrl: coverArtUrl || null,
      tags: tags || [],
      fileStoragePath: filePath,
      streamUrl,
    });

    logger.info('Content uploaded', {
      contentId: content.id,
      creatorId,
      title: content.title,
      fileSize: file.size,
    });

    return {
      id: content.id,
      creatorId: content.creatorId,
      title: content.title,
      description: content.description,
      genre: content.genre,
      duration: content.duration,
      coverArtUrl: content.coverArtUrl,
      tags: content.tags,
      streamUrl: content.streamUrl,
      uploadedAt: content.uploadedAt,
      playCount: content.playCount,
      isActive: content.isActive,
    };
  }
}
