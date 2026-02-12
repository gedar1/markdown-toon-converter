import { Prisma } from '@prisma/client';
import { prisma } from '../../shared/database/client';
import { NotFoundError, ValidationError, AccessDeniedError } from '../../shared/errors/AppError';
import { validateUUID, validateAudioFormat, validateFileSize } from '../../shared/utils/validation';
import { logger } from '../../shared/utils/logger';
import * as fs from 'fs/promises';
import * as path from 'path';
import * as crypto from 'crypto';
import {
  ContentData,
  UploadContentRequest,
  UpdateContentRequest,
  ContentFilters,
  PaginatedContent,
  PlaylistData,
  CreatePlaylistRequest,
  UpdatePlaylistRequest,
  AddContentToPlaylistRequest,
  PlaylistWithContent,
  ALLOWED_AUDIO_FORMATS,
  MAX_FILE_SIZE,
} from './content.types';

export class ContentService {
  private readonly uploadDir = process.env.UPLOAD_DIR || 'uploads';

  /**
   * Upload new content
   */
  async uploadContent(request: UploadContentRequest): Promise<ContentData> {
    const { creatorId, title, description, genre, duration, coverArtUrl, tags, file } = request;

    // Validate creator
    if (!validateUUID(creatorId)) {
      throw new ValidationError('Invalid creator ID format');
    }

    const creator = await prisma.user.findUnique({
      where: { id: creatorId, userType: 'creator' },
    });

    if (!creator) {
      throw new NotFoundError('Creator');
    }

    // Validate file
    if (!validateAudioFormat(file.mimeType)) {
      throw new ValidationError(
        `Invalid audio format. Allowed formats: ${ALLOWED_AUDIO_FORMATS.join(', ')}`
      );
    }

    if (!validateFileSize(file.size, MAX_FILE_SIZE)) {
      throw new ValidationError(`File size exceeds maximum allowed size of ${MAX_FILE_SIZE} bytes`);
    }

    // Generate unique content ID
    const contentId = crypto.randomUUID();

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

    // Create content record
    const content = await prisma.content.create({
      data: {
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
        isActive: true,
      },
    });

    logger.info('Content uploaded', {
      contentId: content.id,
      creatorId,
      title: content.title,
      fileSize: file.size,
    });

    return this.mapContentToData(content);
  }

  /**
   * Update content metadata
   */
  async updateContent(
    contentId: string,
    creatorId: string,
    updates: UpdateContentRequest
  ): Promise<ContentData> {
    if (!validateUUID(contentId) || !validateUUID(creatorId)) {
      throw new ValidationError('Invalid ID format');
    }

    // Verify content exists and belongs to creator
    const existingContent = await prisma.content.findUnique({
      where: { id: contentId },
    });

    if (!existingContent) {
      throw new NotFoundError('Content');
    }

    if (existingContent.creatorId !== creatorId) {
      throw new AccessDeniedError('You can only update your own content');
    }

    // Update content
    const updateData: Prisma.ContentUpdateInput = {};

    if (updates.title !== undefined) {
      updateData.title = updates.title.trim();
    }
    if (updates.description !== undefined) {
      updateData.description = updates.description?.trim() || null;
    }
    if (updates.genre !== undefined) {
      updateData.genre = updates.genre.trim();
    }
    if (updates.coverArtUrl !== undefined) {
      updateData.coverArtUrl = updates.coverArtUrl || null;
    }
    if (updates.tags !== undefined) {
      updateData.tags = updates.tags;
    }
    if (updates.isActive !== undefined) {
      updateData.isActive = updates.isActive;
    }

    const content = await prisma.content.update({
      where: { id: contentId },
      data: updateData,
    });

    logger.info('Content updated', { contentId, creatorId });

    return this.mapContentToData(content);
  }

  /**
   * Delete content
   */
  async deleteContent(contentId: string, creatorId: string): Promise<void> {
    if (!validateUUID(contentId) || !validateUUID(creatorId)) {
      throw new ValidationError('Invalid ID format');
    }

    // Verify content exists and belongs to creator
    const content = await prisma.content.findUnique({
      where: { id: contentId },
    });

    if (!content) {
      throw new NotFoundError('Content');
    }

    if (content.creatorId !== creatorId) {
      throw new AccessDeniedError('You can only delete your own content');
    }

    // Delete file from storage
    try {
      await fs.unlink(content.fileStoragePath);
      // Try to remove directory if empty
      const dir = path.dirname(content.fileStoragePath);
      await fs.rmdir(dir).catch(() => {
        /* Directory not empty, ignore */
      });
    } catch (error) {
      logger.warn('Failed to delete content file', {
        contentId,
        filePath: content.fileStoragePath,
        error,
      });
    }

    // Delete content record (cascade will handle playlist associations)
    await prisma.content.delete({
      where: { id: contentId },
    });

    logger.info('Content deleted', { contentId, creatorId });
  }

  /**
   * Get content by ID
   */
  async getContent(contentId: string, subscriberId?: string): Promise<ContentData> {
    if (!validateUUID(contentId)) {
      throw new ValidationError('Invalid content ID format');
    }

    const content = await prisma.content.findUnique({
      where: { id: contentId },
    });

    if (!content) {
      throw new NotFoundError('Content');
    }

    // If subscriber is provided, verify access
    if (subscriberId) {
      const hasAccess = await this.verifyAccess(subscriberId, content.creatorId);
      if (!hasAccess) {
        throw new AccessDeniedError('You do not have access to this content');
      }
    }

    return this.mapContentToData(content);
  }

  /**
   * Get creator's library
   */
  async getCreatorLibrary(
    creatorId: string,
    filters: ContentFilters = {}
  ): Promise<PaginatedContent> {
    if (!validateUUID(creatorId)) {
      throw new ValidationError('Invalid creator ID format');
    }

    const page = filters.page || 1;
    const limit = filters.limit || 20;
    const skip = (page - 1) * limit;

    // Build where clause
    const where: Prisma.ContentWhereInput = {
      creatorId,
    };

    if (filters.genre) {
      where.genre = filters.genre;
    }

    if (filters.tags && filters.tags.length > 0) {
      where.tags = {
        hasSome: filters.tags,
      };
    }

    if (filters.isActive !== undefined) {
      where.isActive = filters.isActive;
    }

    // Build order by
    const orderBy: Prisma.ContentOrderByWithRelationInput = {};
    if (filters.sortBy === 'playCount') {
      orderBy.playCount = filters.sortOrder || 'desc';
    } else if (filters.sortBy === 'title') {
      orderBy.title = filters.sortOrder || 'asc';
    } else {
      orderBy.uploadedAt = filters.sortOrder || 'desc';
    }

    // Get content
    const [content, total] = await Promise.all([
      prisma.content.findMany({
        where,
        orderBy,
        skip,
        take: limit,
      }),
      prisma.content.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      content: content.map((c) => this.mapContentToData(c)),
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    };
  }

  /**
   * Create playlist
   */
  async createPlaylist(request: CreatePlaylistRequest): Promise<PlaylistData> {
    const { creatorId, name, description, coverArtUrl } = request;

    if (!validateUUID(creatorId)) {
      throw new ValidationError('Invalid creator ID format');
    }

    const creator = await prisma.user.findUnique({
      where: { id: creatorId, userType: 'creator' },
    });

    if (!creator) {
      throw new NotFoundError('Creator');
    }

    const playlist = await prisma.playlist.create({
      data: {
        creatorId,
        name: name.trim(),
        description: description?.trim() || null,
        coverArtUrl: coverArtUrl || null,
        isActive: true,
      },
    });

    logger.info('Playlist created', {
      playlistId: playlist.id,
      creatorId,
      name: playlist.name,
    });

    return this.mapPlaylistToData(playlist, 0);
  }

  /**
   * Update playlist
   */
  async updatePlaylist(
    playlistId: string,
    creatorId: string,
    updates: UpdatePlaylistRequest
  ): Promise<PlaylistData> {
    if (!validateUUID(playlistId) || !validateUUID(creatorId)) {
      throw new ValidationError('Invalid ID format');
    }

    // Verify playlist exists and belongs to creator
    const existingPlaylist = await prisma.playlist.findUnique({
      where: { id: playlistId },
    });

    if (!existingPlaylist) {
      throw new NotFoundError('Playlist');
    }

    if (existingPlaylist.creatorId !== creatorId) {
      throw new AccessDeniedError('You can only update your own playlists');
    }

    // Update playlist
    const updateData: Prisma.PlaylistUpdateInput = {};

    if (updates.name !== undefined) {
      updateData.name = updates.name.trim();
    }
    if (updates.description !== undefined) {
      updateData.description = updates.description?.trim() || null;
    }
    if (updates.coverArtUrl !== undefined) {
      updateData.coverArtUrl = updates.coverArtUrl || null;
    }
    if (updates.isActive !== undefined) {
      updateData.isActive = updates.isActive;
    }

    const playlist = await prisma.playlist.update({
      where: { id: playlistId },
      data: updateData,
    });

    // Get content count
    const contentCount = await prisma.playlistContent.count({
      where: { playlistId },
    });

    logger.info('Playlist updated', { playlistId, creatorId });

    return this.mapPlaylistToData(playlist, contentCount);
  }

  /**
   * Delete playlist
   */
  async deletePlaylist(playlistId: string, creatorId: string): Promise<void> {
    if (!validateUUID(playlistId) || !validateUUID(creatorId)) {
      throw new ValidationError('Invalid ID format');
    }

    // Verify playlist exists and belongs to creator
    const playlist = await prisma.playlist.findUnique({
      where: { id: playlistId },
    });

    if (!playlist) {
      throw new NotFoundError('Playlist');
    }

    if (playlist.creatorId !== creatorId) {
      throw new AccessDeniedError('You can only delete your own playlists');
    }

    // Delete playlist (cascade will handle playlist content associations)
    await prisma.playlist.delete({
      where: { id: playlistId },
    });

    logger.info('Playlist deleted', { playlistId, creatorId });
  }

  /**
   * Get creator's playlists
   */
  async getCreatorPlaylists(creatorId: string): Promise<PlaylistData[]> {
    if (!validateUUID(creatorId)) {
      throw new ValidationError('Invalid creator ID format');
    }

    const playlists = await prisma.playlist.findMany({
      where: { creatorId, isActive: true },
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { playlistContent: true },
        },
      },
    });

    return playlists.map((p) => this.mapPlaylistToData(p, p._count.playlistContent));
  }

  /**
   * Get playlist with content
   */
  async getPlaylistWithContent(playlistId: string): Promise<PlaylistWithContent> {
    if (!validateUUID(playlistId)) {
      throw new ValidationError('Invalid playlist ID format');
    }

    const playlist = await prisma.playlist.findUnique({
      where: { id: playlistId },
      include: {
        playlistContent: {
          include: {
            content: true,
          },
          orderBy: {
            position: 'asc',
          },
        },
      },
    });

    if (!playlist) {
      throw new NotFoundError('Playlist');
    }

    const content = playlist.playlistContent.map((pc) => this.mapContentToData(pc.content));

    return {
      ...this.mapPlaylistToData(playlist, content.length),
      content,
    };
  }

  /**
   * Add content to playlist
   */
  async addContentToPlaylist(request: AddContentToPlaylistRequest): Promise<void> {
    const { playlistId, contentId, position } = request;

    if (!validateUUID(playlistId) || !validateUUID(contentId)) {
      throw new ValidationError('Invalid ID format');
    }

    // Verify playlist and content exist
    const [playlist, content] = await Promise.all([
      prisma.playlist.findUnique({ where: { id: playlistId } }),
      prisma.content.findUnique({ where: { id: contentId } }),
    ]);

    if (!playlist) {
      throw new NotFoundError('Playlist');
    }

    if (!content) {
      throw new NotFoundError('Content');
    }

    // Verify content belongs to same creator
    if (playlist.creatorId !== content.creatorId) {
      throw new ValidationError('Content must belong to the same creator as the playlist');
    }

    // Check if content already in playlist
    const existing = await prisma.playlistContent.findUnique({
      where: {
        playlistId_contentId: {
          playlistId,
          contentId,
        },
      },
    });

    if (existing) {
      throw new ValidationError('Content is already in this playlist');
    }

    // Get next position if not provided
    let finalPosition = position;
    if (finalPosition === undefined) {
      const maxPosition = await prisma.playlistContent.findFirst({
        where: { playlistId },
        orderBy: { position: 'desc' },
        select: { position: true },
      });
      finalPosition = (maxPosition?.position || 0) + 1;
    }

    // Add content to playlist
    await prisma.playlistContent.create({
      data: {
        playlistId,
        contentId,
        position: finalPosition,
      },
    });

    logger.info('Content added to playlist', {
      playlistId,
      contentId,
      position: finalPosition,
    });
  }

  /**
   * Remove content from playlist
   */
  async removeContentFromPlaylist(playlistId: string, contentId: string): Promise<void> {
    if (!validateUUID(playlistId) || !validateUUID(contentId)) {
      throw new ValidationError('Invalid ID format');
    }

    const playlistContent = await prisma.playlistContent.findUnique({
      where: {
        playlistId_contentId: {
          playlistId,
          contentId,
        },
      },
    });

    if (!playlistContent) {
      throw new NotFoundError('Content not found in playlist');
    }

    await prisma.playlistContent.delete({
      where: {
        playlistId_contentId: {
          playlistId,
          contentId,
        },
      },
    });

    logger.info('Content removed from playlist', { playlistId, contentId });
  }

  /**
   * Verify subscriber has access to creator's content
   */
  private async verifyAccess(subscriberId: string, creatorId: string): Promise<boolean> {
    const grant = await prisma.accessGrant.findFirst({
      where: {
        subscriberId,
        creatorId,
        isActive: true,
      },
    });

    if (!grant) {
      return false;
    }

    // Check expiration
    if (grant.expiresAt && grant.expiresAt < new Date()) {
      return false;
    }

    return true;
  }

  /**
   * Map Prisma content to ContentData
   */
  private mapContentToData(content: any): ContentData {
    return {
      id: content.id,
      creatorId: content.creatorId,
      title: content.title,
      description: content.description,
      genre: content.genre,
      duration: content.duration,
      coverArtUrl: content.coverArtUrl,
      tags: content.tags,
      fileStoragePath: content.fileStoragePath,
      streamUrl: content.streamUrl,
      uploadedAt: content.uploadedAt,
      playCount: content.playCount,
      isActive: content.isActive,
    };
  }

  /**
   * Map Prisma playlist to PlaylistData
   */
  private mapPlaylistToData(playlist: any, contentCount: number): PlaylistData {
    return {
      id: playlist.id,
      creatorId: playlist.creatorId,
      name: playlist.name,
      description: playlist.description,
      coverArtUrl: playlist.coverArtUrl,
      createdAt: playlist.createdAt,
      updatedAt: playlist.updatedAt,
      isActive: playlist.isActive,
      contentCount,
    };
  }
}

// Export singleton instance
export const contentService = new ContentService();
