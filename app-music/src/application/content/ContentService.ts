import {
  UploadContent,
  UploadContentInput,
  UploadContentOutput,
} from '../../domain/content/use-cases/UploadContent';
import { GetContent, GetContentInput } from '../../domain/content/use-cases/GetContent';
import { DeleteContent, DeleteContentInput } from '../../domain/content/use-cases/DeleteContent';
import {
  CreatePlaylist,
  CreatePlaylistInput,
  CreatePlaylistOutput,
} from '../../domain/content/use-cases/CreatePlaylist';
import {
  AddContentToPlaylist,
  AddContentToPlaylistInput,
} from '../../domain/content/use-cases/AddContentToPlaylist';

import { PrismaContentRepository } from '../../infrastructure/persistence/PrismaContentRepository';
import { PrismaPlaylistRepository } from '../../infrastructure/persistence/PrismaPlaylistRepository';
import { LocalFileStorageService } from '../../infrastructure/services/LocalFileStorageService';
import { PrismaAccessVerificationService } from '../../infrastructure/services/PrismaAccessVerificationService';

import {
  Content,
  ContentFilters,
  PaginatedContent,
} from '../../domain/content/repositories/IContentRepository';
import { PlaylistWithCount } from '../../domain/content/repositories/IPlaylistRepository';

/**
 * Application Service for Content Management
 *
 * EXTRACCIÓN: Orquestación de use cases + Dependency Injection
 * UBICACIÓN: application/content/
 * POR QUÉ: Conecta los use cases con los adaptadores
 * RESPONSABILIDAD:
 *   1. Crear instancias de adaptadores (Prisma, FileStorage, etc.)
 *   2. Inyectar adaptadores en use cases
 *   3. Exponer métodos simples para el controller
 */
export class ContentService {
  // Use cases
  private uploadContentUseCase: UploadContent;
  private getContentUseCase: GetContent;
  private deleteContentUseCase: DeleteContent;
  private createPlaylistUseCase: CreatePlaylist;
  private addContentToPlaylistUseCase: AddContentToPlaylist;

  // Repositories (para operaciones directas)
  private contentRepository: PrismaContentRepository;
  private playlistRepository: PrismaPlaylistRepository;

  constructor() {
    // ═══════════════════════════════════════════════════════════
    // DEPENDENCY INJECTION
    // ═══════════════════════════════════════════════════════════

    // 1. Crear adaptadores (implementaciones concretas)
    this.contentRepository = new PrismaContentRepository();
    this.playlistRepository = new PrismaPlaylistRepository();
    const fileStorage = new LocalFileStorageService();
    const accessVerification = new PrismaAccessVerificationService();

    // 2. Inyectar adaptadores en use cases
    this.uploadContentUseCase = new UploadContent(this.contentRepository, fileStorage);
    this.getContentUseCase = new GetContent(this.contentRepository, accessVerification);
    this.deleteContentUseCase = new DeleteContent(this.contentRepository, fileStorage);
    this.createPlaylistUseCase = new CreatePlaylist(this.playlistRepository);
    this.addContentToPlaylistUseCase = new AddContentToPlaylist(
      this.playlistRepository,
      this.contentRepository
    );
  }

  /**
   * Upload content
   */
  async uploadContent(input: UploadContentInput): Promise<UploadContentOutput> {
    return await this.uploadContentUseCase.execute(input);
  }

  /**
   * Get content by ID
   */
  async getContent(input: GetContentInput): Promise<Content> {
    return await this.getContentUseCase.execute(input);
  }

  /**
   * Update content
   */
  async updateContent(
    contentId: string,
    creatorId: string,
    updates: Partial<Content>
  ): Promise<Content> {
    // Verificar ownership
    const content = await this.contentRepository.findById(contentId);
    if (!content) {
      throw new Error('Content not found');
    }
    if (content.creatorId !== creatorId) {
      throw new Error('Access denied');
    }

    return await this.contentRepository.update(contentId, updates);
  }

  /**
   * Delete content
   */
  async deleteContent(input: DeleteContentInput): Promise<void> {
    return await this.deleteContentUseCase.execute(input);
  }

  /**
   * Get creator library
   */
  async getCreatorLibrary(creatorId: string, filters: ContentFilters): Promise<PaginatedContent> {
    return await this.contentRepository.getCreatorLibrary(creatorId, filters);
  }

  /**
   * Create playlist
   */
  async createPlaylist(input: CreatePlaylistInput): Promise<CreatePlaylistOutput> {
    return await this.createPlaylistUseCase.execute(input);
  }

  /**
   * Update playlist
   */
  async updatePlaylist(playlistId: string, creatorId: string, updates: any): Promise<any> {
    const playlist = await this.playlistRepository.findById(playlistId);
    if (!playlist) {
      throw new Error('Playlist not found');
    }
    if (playlist.creatorId !== creatorId) {
      throw new Error('Access denied');
    }

    const updated = await this.playlistRepository.update(playlistId, updates);
    const contentCount = await this.playlistRepository.getContentCount(playlistId);

    return {
      ...updated,
      contentCount,
    };
  }

  /**
   * Delete playlist
   */
  async deletePlaylist(playlistId: string, creatorId: string): Promise<void> {
    const playlist = await this.playlistRepository.findById(playlistId);
    if (!playlist) {
      throw new Error('Playlist not found');
    }
    if (playlist.creatorId !== creatorId) {
      throw new Error('Access denied');
    }

    await this.playlistRepository.delete(playlistId);
  }

  /**
   * Get creator playlists
   */
  async getCreatorPlaylists(creatorId: string): Promise<PlaylistWithCount[]> {
    return await this.playlistRepository.getCreatorPlaylists(creatorId);
  }

  /**
   * Get playlist with content
   */
  async getPlaylistWithContent(playlistId: string): Promise<any> {
    const result = await this.playlistRepository.getWithContent(playlistId);
    if (!result) {
      throw new Error('Playlist not found');
    }

    return {
      ...result.playlist,
      contentCount: result.content.length,
      content: result.content.map((pc) => pc.content),
    };
  }

  /**
   * Add content to playlist
   */
  async addContentToPlaylist(input: AddContentToPlaylistInput): Promise<void> {
    return await this.addContentToPlaylistUseCase.execute(input);
  }

  /**
   * Remove content from playlist
   */
  async removeContentFromPlaylist(playlistId: string, contentId: string): Promise<void> {
    await this.playlistRepository.removeContent(playlistId, contentId);
  }
}

// Export singleton instance
export const contentService = new ContentService();
