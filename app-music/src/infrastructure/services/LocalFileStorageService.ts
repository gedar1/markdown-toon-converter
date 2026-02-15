import * as fs from 'fs/promises';
import * as path from 'path';
import {
  IFileStorageService,
  FileData,
  StorageResult,
} from '../../domain/content/repositories/IFileStorageService';

/**
 * Local File System implementation of IFileStorageService (ADAPTER)
 *
 * EXTRACCIÓN: Implementación con sistema de archivos local (fs)
 * UBICACIÓN: infrastructure/services/
 * POR QUÉ: El dominio no debe conocer 'fs' de Node.js
 * BENEFICIO: Puedo cambiar a S3, Google Cloud Storage sin tocar el dominio
 */
export class LocalFileStorageService implements IFileStorageService {
  private readonly uploadDir: string;

  constructor(uploadDir?: string) {
    this.uploadDir = uploadDir || process.env.UPLOAD_DIR || 'uploads';
  }

  async saveAudioFile(
    creatorId: string,
    contentId: string,
    file: FileData
  ): Promise<StorageResult> {
    // Create storage path
    const storagePath = path.join(this.uploadDir, 'audio', creatorId, contentId);
    const fileName = `${contentId}${path.extname(file.originalName)}`;
    const filePath = path.join(storagePath, fileName);

    // Ensure directory exists
    await fs.mkdir(storagePath, { recursive: true });

    // Save file
    await fs.writeFile(filePath, file.buffer);

    // Generate stream URL
    const streamUrl = `/stream/${creatorId}/${contentId}/${fileName}`;

    return {
      filePath,
      streamUrl,
    };
  }

  async deleteAudioFile(filePath: string): Promise<void> {
    try {
      await fs.unlink(filePath);

      // Try to remove directory if empty
      const dir = path.dirname(filePath);
      await fs.rmdir(dir).catch(() => {
        // Directory not empty, ignore
      });
    } catch (error) {
      // File might not exist, ignore
      throw error;
    }
  }

  async fileExists(filePath: string): Promise<boolean> {
    try {
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }
}
