import { Response } from 'express';
import { contentService } from './content.service';
import { AuthenticatedRequest } from '../auth/auth.middleware';
import { validateSchema, commonSchemas } from '../../shared/utils/validation';
import { logger } from '../../shared/utils/logger';
import { z } from 'zod';

/**
 * Validation schemas
 */
const uploadContentSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  description: z.string().max(1000).optional(),
  genre: z.string().min(1, 'Genre is required'),
  duration: commonSchemas.positiveInt,
  coverArtUrl: commonSchemas.url,
  tags: z.array(z.string()).optional(),
});

const updateContentSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().max(1000).optional(),
  genre: z.string().min(1).optional(),
  coverArtUrl: commonSchemas.url,
  tags: z.array(z.string()).optional(),
  isActive: z.boolean().optional(),
});

const createPlaylistSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  description: z.string().max(500).optional(),
  coverArtUrl: commonSchemas.url,
});

const updatePlaylistSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional(),
  coverArtUrl: commonSchemas.url,
  isActive: z.boolean().optional(),
});

/**
 * Content Controller
 */
export class ContentController {
  /**
   * Upload content
   * POST /content
   */
  async uploadContent(req: AuthenticatedRequest, res: Response): Promise<void> {
    if (!req.user || req.user.userType !== 'creator') {
      res.status(403).json({
        status: 'error',
        code: 'ACCESS_DENIED',
        message: 'Only creators can upload content',
        timestamp: new Date().toISOString(),
      });
      return;
    }

    // Validate file
    if (!req.file) {
      res.status(400).json({
        status: 'error',
        code: 'VALIDATION_ERROR',
        message: 'Audio file is required',
        timestamp: new Date().toISOString(),
      });
      return;
    }

    const data = validateSchema(uploadContentSchema, req.body);

    const result = await contentService.uploadContent({
      creatorId: req.user.userId,
      title: data.title,
      description: data.description,
      genre: data.genre,
      duration: data.duration,
      coverArtUrl: data.coverArtUrl,
      tags: data.tags,
      file: {
        originalName: req.file.originalname,
        mimeType: req.file.mimetype,
        size: req.file.size,
        buffer: req.file.buffer,
      },
    });

    logger.info('Content uploaded via API', {
      contentId: result.id,
      creatorId: req.user.userId,
    });

    res.status(201).json({
      status: 'success',
      data: result,
      message: 'Content uploaded successfully',
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Get content by ID
   * GET /content/:id
   */
  async getContent(req: AuthenticatedRequest, res: Response): Promise<void> {
    const { id } = req.params;
    const subscriberId = req.user?.userType === 'subscriber' ? req.user.userId : undefined;

    const content = await contentService.getContent(id, subscriberId);

    res.status(200).json({
      status: 'success',
      data: content,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Update content
   * PUT /content/:id
   */
  async updateContent(req: AuthenticatedRequest, res: Response): Promise<void> {
    if (!req.user || req.user.userType !== 'creator') {
      res.status(403).json({
        status: 'error',
        code: 'ACCESS_DENIED',
        message: 'Only creators can update content',
        timestamp: new Date().toISOString(),
      });
      return;
    }

    const { id } = req.params;
    const updates = validateSchema(updateContentSchema, req.body);

    const result = await contentService.updateContent(id, req.user.userId, updates);

    res.status(200).json({
      status: 'success',
      data: result,
      message: 'Content updated successfully',
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Delete content
   * DELETE /content/:id
   */
  async deleteContent(req: AuthenticatedRequest, res: Response): Promise<void> {
    if (!req.user || req.user.userType !== 'creator') {
      res.status(403).json({
        status: 'error',
        code: 'ACCESS_DENIED',
        message: 'Only creators can delete content',
        timestamp: new Date().toISOString(),
      });
      return;
    }

    const { id } = req.params;

    await contentService.deleteContent(id, req.user.userId);

    res.status(200).json({
      status: 'success',
      message: 'Content deleted successfully',
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Get creator library
   * GET /content/creator/:creatorId
   */
  async getCreatorLibrary(req: AuthenticatedRequest, res: Response): Promise<void> {
    const { creatorId } = req.params;
    const { genre, tags, isActive, sortBy, sortOrder, page, limit } = req.query;

    const filters = {
      genre: genre as string | undefined,
      tags: tags ? (tags as string).split(',') : undefined,
      isActive: isActive === 'true' ? true : isActive === 'false' ? false : undefined,
      sortBy: sortBy as any,
      sortOrder: sortOrder as any,
      page: page ? parseInt(page as string, 10) : undefined,
      limit: limit ? parseInt(limit as string, 10) : undefined,
    };

    const result = await contentService.getCreatorLibrary(creatorId, filters);

    res.status(200).json({
      status: 'success',
      data: result.content,
      pagination: result.pagination,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Create playlist
   * POST /playlists
   */
  async createPlaylist(req: AuthenticatedRequest, res: Response): Promise<void> {
    if (!req.user || req.user.userType !== 'creator') {
      res.status(403).json({
        status: 'error',
        code: 'ACCESS_DENIED',
        message: 'Only creators can create playlists',
        timestamp: new Date().toISOString(),
      });
      return;
    }

    const data = validateSchema(createPlaylistSchema, req.body);

    const result = await contentService.createPlaylist({
      creatorId: req.user.userId,
      name: data.name,
      description: data.description,
      coverArtUrl: data.coverArtUrl,
    });

    res.status(201).json({
      status: 'success',
      data: result,
      message: 'Playlist created successfully',
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Get playlist
   * GET /playlists/:id
   */
  async getPlaylist(req: AuthenticatedRequest, res: Response): Promise<void> {
    const { id } = req.params;

    const playlist = await contentService.getPlaylistWithContent(id);

    res.status(200).json({
      status: 'success',
      data: playlist,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Update playlist
   * PUT /playlists/:id
   */
  async updatePlaylist(req: AuthenticatedRequest, res: Response): Promise<void> {
    if (!req.user || req.user.userType !== 'creator') {
      res.status(403).json({
        status: 'error',
        code: 'ACCESS_DENIED',
        message: 'Only creators can update playlists',
        timestamp: new Date().toISOString(),
      });
      return;
    }

    const { id } = req.params;
    const updates = validateSchema(updatePlaylistSchema, req.body);

    const result = await contentService.updatePlaylist(id, req.user.userId, updates);

    res.status(200).json({
      status: 'success',
      data: result,
      message: 'Playlist updated successfully',
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Delete playlist
   * DELETE /playlists/:id
   */
  async deletePlaylist(req: AuthenticatedRequest, res: Response): Promise<void> {
    if (!req.user || req.user.userType !== 'creator') {
      res.status(403).json({
        status: 'error',
        code: 'ACCESS_DENIED',
        message: 'Only creators can delete playlists',
        timestamp: new Date().toISOString(),
      });
      return;
    }

    const { id } = req.params;

    await contentService.deletePlaylist(id, req.user.userId);

    res.status(200).json({
      status: 'success',
      message: 'Playlist deleted successfully',
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Get creator playlists
   * GET /playlists/creator/:creatorId
   */
  async getCreatorPlaylists(req: AuthenticatedRequest, res: Response): Promise<void> {
    const { creatorId } = req.params;

    const playlists = await contentService.getCreatorPlaylists(creatorId);

    res.status(200).json({
      status: 'success',
      data: playlists,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Add content to playlist
   * POST /playlists/:id/content
   */
  async addContentToPlaylist(req: AuthenticatedRequest, res: Response): Promise<void> {
    if (!req.user || req.user.userType !== 'creator') {
      res.status(403).json({
        status: 'error',
        code: 'ACCESS_DENIED',
        message: 'Only creators can modify playlists',
        timestamp: new Date().toISOString(),
      });
      return;
    }

    const { id } = req.params;
    const { contentId, position } = req.body;

    await contentService.addContentToPlaylist({
      playlistId: id,
      contentId,
      position,
    });

    res.status(200).json({
      status: 'success',
      message: 'Content added to playlist successfully',
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Remove content from playlist
   * DELETE /playlists/:id/content/:contentId
   */
  async removeContentFromPlaylist(req: AuthenticatedRequest, res: Response): Promise<void> {
    if (!req.user || req.user.userType !== 'creator') {
      res.status(403).json({
        status: 'error',
        code: 'ACCESS_DENIED',
        message: 'Only creators can modify playlists',
        timestamp: new Date().toISOString(),
      });
      return;
    }

    const { id, contentId } = req.params;

    await contentService.removeContentFromPlaylist(id, contentId);

    res.status(200).json({
      status: 'success',
      message: 'Content removed from playlist successfully',
      timestamp: new Date().toISOString(),
    });
  }
}

// Export singleton instance
export const contentController = new ContentController();
