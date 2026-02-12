import { Response } from 'express';
import { usersService } from './users.service';
import { AuthenticatedRequest } from '../auth/auth.middleware';
import { validateSchema, commonSchemas } from '../../shared/utils/validation';
import { logger } from '../../shared/utils/logger';
import { z } from 'zod';

/**
 * Validation schemas
 */
const updateCreatorProfileSchema = z.object({
  displayName: commonSchemas.displayName.optional(),
  bio: commonSchemas.bio,
  avatarUrl: commonSchemas.url,
  genres: z.array(z.string()).optional(),
});

const updateSubscriberProfileSchema = z.object({
  displayName: commonSchemas.displayName.optional(),
  bio: commonSchemas.bio,
  avatarUrl: commonSchemas.url,
});

const creatorSearchSchema = z.object({
  query: z.string().optional(),
  genres: z.string().optional(), // Comma-separated
  sortBy: z.enum(['subscriberCount', 'totalStreams', 'displayName']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
  page: z.string().optional(),
  limit: z.string().optional(),
});

/**
 * Users Controller
 */
export class UsersController {
  /**
   * Get creator profile
   * GET /creators/:id
   */
  async getCreatorProfile(req: AuthenticatedRequest, res: Response): Promise<void> {
    const { id } = req.params;

    const profile = await usersService.getCreatorProfile(id);

    res.status(200).json({
      status: 'success',
      data: profile,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Update creator profile
   * PUT /creators/:id
   * Requires authentication and creator authorization
   */
  async updateCreatorProfile(req: AuthenticatedRequest, res: Response): Promise<void> {
    const { id } = req.params;

    // Verify user is updating their own profile
    if (req.user?.userId !== id) {
      res.status(403).json({
        status: 'error',
        code: 'ACCESS_DENIED',
        message: 'You can only update your own profile',
        timestamp: new Date().toISOString(),
      });
      return;
    }

    const updates = validateSchema(updateCreatorProfileSchema, req.body);

    const profile = await usersService.updateCreatorProfile(id, updates);

    logger.info('Creator profile updated via API', { userId: id });

    res.status(200).json({
      status: 'success',
      data: profile,
      message: 'Profile updated successfully',
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Get creator's subscribers
   * GET /creators/:id/subscribers
   * Requires authentication and creator authorization
   */
  async getCreatorSubscribers(req: AuthenticatedRequest, res: Response): Promise<void> {
    const { id } = req.params;

    // Verify user is accessing their own subscribers
    if (req.user?.userId !== id) {
      res.status(403).json({
        status: 'error',
        code: 'ACCESS_DENIED',
        message: 'You can only view your own subscribers',
        timestamp: new Date().toISOString(),
      });
      return;
    }

    const subscribers = await usersService.getCreatorSubscribers(id);

    res.status(200).json({
      status: 'success',
      data: subscribers,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Get subscriber profile
   * GET /subscribers/:id
   */
  async getSubscriberProfile(req: AuthenticatedRequest, res: Response): Promise<void> {
    const { id } = req.params;

    const profile = await usersService.getSubscriberProfile(id);

    res.status(200).json({
      status: 'success',
      data: profile,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Update subscriber profile
   * PUT /subscribers/:id
   * Requires authentication and subscriber authorization
   */
  async updateSubscriberProfile(req: AuthenticatedRequest, res: Response): Promise<void> {
    const { id } = req.params;

    // Verify user is updating their own profile
    if (req.user?.userId !== id) {
      res.status(403).json({
        status: 'error',
        code: 'ACCESS_DENIED',
        message: 'You can only update your own profile',
        timestamp: new Date().toISOString(),
      });
      return;
    }

    const updates = validateSchema(updateSubscriberProfileSchema, req.body);

    const profile = await usersService.updateSubscriberProfile(id, updates);

    logger.info('Subscriber profile updated via API', { userId: id });

    res.status(200).json({
      status: 'success',
      data: profile,
      message: 'Profile updated successfully',
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Get subscriber's access list
   * GET /subscribers/:id/access
   * Requires authentication and subscriber authorization
   */
  async getSubscriberAccessList(req: AuthenticatedRequest, res: Response): Promise<void> {
    const { id } = req.params;

    // Verify user is accessing their own access list
    if (req.user?.userId !== id) {
      res.status(403).json({
        status: 'error',
        code: 'ACCESS_DENIED',
        message: 'You can only view your own access list',
        timestamp: new Date().toISOString(),
      });
      return;
    }

    const accessList = await usersService.getSubscriberAccessList(id);

    res.status(200).json({
      status: 'success',
      data: accessList,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * List creators (discovery)
   * GET /creators
   */
  async listCreators(req: AuthenticatedRequest, res: Response): Promise<void> {
    const queryData = validateSchema(creatorSearchSchema, req.query);

    const filters = {
      query: queryData.query,
      genres: queryData.genres ? queryData.genres.split(',').map((g) => g.trim()) : undefined,
      sortBy: queryData.sortBy,
      sortOrder: queryData.sortOrder,
      page: queryData.page ? Number.parseInt(queryData.page, 10) : undefined,
      limit: queryData.limit ? Number.parseInt(queryData.limit, 10) : undefined,
    };

    const subscriberId = req.user?.userType === 'subscriber' ? req.user.userId : undefined;

    const result = await usersService.listCreators(filters, subscriberId);

    res.status(200).json({
      status: 'success',
      data: result.creators,
      pagination: result.pagination,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Search creators
   * GET /creators/search
   */
  async searchCreators(req: AuthenticatedRequest, res: Response): Promise<void> {
    const { q } = req.query;

    if (!q || typeof q !== 'string') {
      res.status(400).json({
        status: 'error',
        code: 'VALIDATION_ERROR',
        message: 'Search query is required',
        timestamp: new Date().toISOString(),
      });
      return;
    }

    const subscriberId = req.user?.userType === 'subscriber' ? req.user.userId : undefined;

    const creators = await usersService.searchCreators(q, subscriberId);

    res.status(200).json({
      status: 'success',
      data: creators,
      timestamp: new Date().toISOString(),
    });
  }
}

// Export singleton instance
export const usersController = new UsersController();
