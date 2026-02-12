import { Prisma } from '@prisma/client';
import { prisma } from '../../shared/database/client';
import { NotFoundError, ValidationError } from '../../shared/errors/AppError';
import { validateUUID } from '../../shared/utils/validation';
import { logger } from '../../shared/utils/logger';
import {
  CreatorProfileData,
  SubscriberProfileData,
  UpdateCreatorProfileRequest,
  UpdateSubscriberProfileRequest,
  CreatorPreview,
  SubscriberInfo,
  AccessGrantInfo,
  CreatorSearchFilters,
  PaginatedCreators,
} from './users.types';

export class UsersService {
  /**
   * Get creator profile by user ID
   */
  async getCreatorProfile(userId: string): Promise<CreatorProfileData> {
    if (!validateUUID(userId)) {
      throw new ValidationError('Invalid user ID format');
    }

    const user = await prisma.user.findUnique({
      where: { id: userId, userType: 'creator' },
      include: {
        creatorProfile: true,
      },
    });

    if (!user || !user.creatorProfile) {
      throw new NotFoundError('Creator profile');
    }

    return {
      userId: user.id,
      displayName: user.displayName,
      bio: user.bio,
      avatarUrl: user.avatarUrl,
      genres: user.creatorProfile.genres,
      subscriberCount: user.creatorProfile.subscriberCount,
      totalStreams: user.creatorProfile.totalStreams,
      totalRevenue: user.creatorProfile.totalRevenue,
      createdAt: user.createdAt,
      updatedAt: user.creatorProfile.updatedAt,
    };
  }

  /**
   * Update creator profile
   */
  async updateCreatorProfile(
    userId: string,
    updates: UpdateCreatorProfileRequest
  ): Promise<CreatorProfileData> {
    if (!validateUUID(userId)) {
      throw new ValidationError('Invalid user ID format');
    }

    // Verify creator exists
    const existingUser = await prisma.user.findUnique({
      where: { id: userId, userType: 'creator' },
      include: { creatorProfile: true },
    });

    if (!existingUser || !existingUser.creatorProfile) {
      throw new NotFoundError('Creator profile');
    }

    // Update user and profile in transaction
    await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      // Update user fields
      const userUpdates: {
        displayName?: string;
        bio?: string | null;
        avatarUrl?: string | null;
      } = {};

      if (updates.displayName !== undefined) {
        userUpdates.displayName = updates.displayName.trim();
      }
      if (updates.bio !== undefined) {
        userUpdates.bio = updates.bio?.trim() || null;
      }
      if (updates.avatarUrl !== undefined) {
        userUpdates.avatarUrl = updates.avatarUrl || null;
      }

      const user = await tx.user.update({
        where: { id: userId },
        data: userUpdates,
        include: { creatorProfile: true },
      });

      // Update creator profile fields
      if (updates.genres !== undefined) {
        await tx.creatorProfile.update({
          where: { userId },
          data: { genres: updates.genres },
        });
      }

      return user;
    });

    logger.info('Creator profile updated', { userId });

    return this.getCreatorProfile(userId);
  }

  /**
   * Get creator's subscribers
   */
  async getCreatorSubscribers(creatorId: string): Promise<SubscriberInfo[]> {
    if (!validateUUID(creatorId)) {
      throw new ValidationError('Invalid creator ID format');
    }

    const grants = await prisma.accessGrant.findMany({
      where: {
        creatorId,
        isActive: true,
      },
      include: {
        subscriber: true,
      },
      orderBy: {
        grantedAt: 'desc',
      },
    });

    return grants.map((grant) => ({
      userId: grant.subscriber.id,
      displayName: grant.subscriber.displayName,
      avatarUrl: grant.subscriber.avatarUrl,
      grantedAt: grant.grantedAt,
      expiresAt: grant.expiresAt,
      isActive: grant.isActive,
    }));
  }

  /**
   * Get subscriber profile by user ID
   */
  async getSubscriberProfile(userId: string): Promise<SubscriberProfileData> {
    if (!validateUUID(userId)) {
      throw new ValidationError('Invalid user ID format');
    }

    const user = await prisma.user.findUnique({
      where: { id: userId, userType: 'subscriber' },
      include: {
        subscriberProfile: true,
      },
    });

    if (!user || !user.subscriberProfile) {
      throw new NotFoundError('Subscriber profile');
    }

    return {
      userId: user.id,
      displayName: user.displayName,
      bio: user.bio,
      avatarUrl: user.avatarUrl,
      activeAccessCount: user.subscriberProfile.activeAccessCount,
      totalStreams: user.subscriberProfile.totalStreams,
      createdAt: user.createdAt,
      updatedAt: user.subscriberProfile.updatedAt,
    };
  }

  /**
   * Update subscriber profile
   */
  async updateSubscriberProfile(
    userId: string,
    updates: UpdateSubscriberProfileRequest
  ): Promise<SubscriberProfileData> {
    if (!validateUUID(userId)) {
      throw new ValidationError('Invalid user ID format');
    }

    // Verify subscriber exists
    const existingUser = await prisma.user.findUnique({
      where: { id: userId, userType: 'subscriber' },
      include: { subscriberProfile: true },
    });

    if (!existingUser || !existingUser.subscriberProfile) {
      throw new NotFoundError('Subscriber profile');
    }

    // Update user fields
    const userUpdates: {
      displayName?: string;
      bio?: string | null;
      avatarUrl?: string | null;
    } = {};

    if (updates.displayName !== undefined) {
      userUpdates.displayName = updates.displayName.trim();
    }
    if (updates.bio !== undefined) {
      userUpdates.bio = updates.bio?.trim() || null;
    }
    if (updates.avatarUrl !== undefined) {
      userUpdates.avatarUrl = updates.avatarUrl || null;
    }

    await prisma.user.update({
      where: { id: userId },
      data: userUpdates,
    });

    logger.info('Subscriber profile updated', { userId });

    return this.getSubscriberProfile(userId);
  }

  /**
   * Get subscriber's access list
   */
  async getSubscriberAccessList(subscriberId: string): Promise<AccessGrantInfo[]> {
    if (!validateUUID(subscriberId)) {
      throw new ValidationError('Invalid subscriber ID format');
    }

    const grants = await prisma.accessGrant.findMany({
      where: {
        subscriberId,
        isActive: true,
      },
      include: {
        creator: true,
      },
      orderBy: {
        grantedAt: 'desc',
      },
    });

    return grants.map((grant) => ({
      creatorId: grant.creator.id,
      creatorName: grant.creator.displayName,
      creatorAvatar: grant.creator.avatarUrl,
      grantedAt: grant.grantedAt,
      expiresAt: grant.expiresAt,
      isActive: grant.isActive,
    }));
  }

  /**
   * List all creators (for discovery)
   */
  async listCreators(
    filters: CreatorSearchFilters = {},
    subscriberId?: string
  ): Promise<PaginatedCreators> {
    const page = filters.page || 1;
    const limit = filters.limit || 20;
    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {
      userType: 'creator',
      isActive: true,
    };

    // Add search query
    if (filters.query) {
      where.OR = [
        { displayName: { contains: filters.query, mode: 'insensitive' } },
        { bio: { contains: filters.query, mode: 'insensitive' } },
      ];
    }

    // Add genre filter
    if (filters.genres && filters.genres.length > 0) {
      where.creatorProfile = {
        genres: {
          hasSome: filters.genres,
        },
      };
    }

    // Build order by
    const orderBy: any = {};
    if (filters.sortBy === 'subscriberCount') {
      orderBy.creatorProfile = { subscriberCount: filters.sortOrder || 'desc' };
    } else if (filters.sortBy === 'totalStreams') {
      orderBy.creatorProfile = { totalStreams: filters.sortOrder || 'desc' };
    } else {
      orderBy.displayName = filters.sortOrder || 'asc';
    }

    // Get creators
    const [creators, total] = await Promise.all([
      prisma.user.findMany({
        where,
        include: {
          creatorProfile: true,
        },
        orderBy,
        skip,
        take: limit,
      }),
      prisma.user.count({ where }),
    ]);

    // Check access for subscriber
    let accessMap: Map<string, boolean> = new Map();
    if (subscriberId) {
      const grants = await prisma.accessGrant.findMany({
        where: {
          subscriberId,
          isActive: true,
          creatorId: { in: creators.map((c) => c.id) },
        },
        select: { creatorId: true },
      });
      accessMap = new Map(grants.map((g) => [g.creatorId, true]));
    }

    const creatorPreviews: CreatorPreview[] = creators.map((creator) => ({
      userId: creator.id,
      displayName: creator.displayName,
      bio: creator.bio,
      avatarUrl: creator.avatarUrl,
      genres: creator.creatorProfile?.genres || [],
      subscriberCount: creator.creatorProfile?.subscriberCount || 0,
      hasAccess: accessMap.get(creator.id) || false,
    }));

    const totalPages = Math.ceil(total / limit);

    return {
      creators: creatorPreviews,
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
   * Search creators by query
   */
  async searchCreators(query: string, subscriberId?: string): Promise<CreatorPreview[]> {
    const result = await this.listCreators(
      {
        query,
        limit: 10,
      },
      subscriberId
    );

    return result.creators;
  }
}

// Export singleton instance
export const usersService = new UsersService();
