/**
 * File data for upload
 */
export interface FileData {
  buffer: Buffer;
  originalName: string;
  mimeType: string;
  size: number;
}

/**
 * Storage result
 */
export interface StorageResult {
  filePath: string;
  streamUrl: string;
}

/**
 * File Storage Service interface (PORT)
 *
 * EXTRACCIÓN: Operaciones de almacenamiento de archivos físicos
 * UBICACIÓN: domain/content/repositories/ (Puerto - Interface)
 * POR QUÉ: El dominio no debe conocer el sistema de archivos (fs)
 */
export interface IFileStorageService {
  /**
   * Save audio file to storage
   */
  saveAudioFile(creatorId: string, contentId: string, file: FileData): Promise<StorageResult>;

  /**
   * Delete audio file from storage
   */
  deleteAudioFile(filePath: string): Promise<void>;

  /**
   * Check if file exists
   */
  fileExists(filePath: string): Promise<boolean>;
}
