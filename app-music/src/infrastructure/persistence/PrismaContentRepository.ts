import { Prisma } from '@prisma/client';
import { prisma } from '../../shared/database/client';
import {
  IContentRepository,
  Content,
  ContentFilters,
  PaginatedContent,
} from '../../domain/content/repositories/IContentRepository';

/**
 * Prisma implementation of IContentRepository (ADAPTER)
 *
 * EXTRACCIÓN: Implementación real con Prisma
 * UBICACIÓN: infrastructure/persistence/
 * POR QUÉ: Separa la implementación de Prisma del dominio
 * BENEFICIO: Puedo cambiar a TypeORM sin tocar el dominio
 */
export class PrismaContentRepository implements IContentRepository {
  async create(data: {
    id: string;
    creatorId: string;
    title: string;
    description: string | null;
    genre: string;
    duration: number;
    coverArtUrl: string | null;
    tags: string[];
    fileStoragePath: string;
    streamUrl: string;
  }): Promise<Content> {
    return await prisma.content.create({
      data: {
        ...data,
        isActive: true,
      },
    });
  }

  async findById(contentId: string): Promise<Content | null> {
    return await prisma.content.findUnique({
      where: { id: contentId },
    });
  }

  async update(contentId: string, data: Partial<Content>): Promise<Content> {
    return await prisma.content.update({
      where: { id: contentId },
      data,
    });
  }

  async delete(contentId: string): Promise<void> {
    await prisma.content.delete({
      where: { id: contentId },
    });
  }

  async getCreatorLibrary(creatorId: string, filters: ContentFilters): Promise<PaginatedContent> {
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
      content,
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

  async incrementPlayCount(contentId: string): Promise<void> {
    await prisma.content.update({
      where: { id: contentId },
      data: {
        playCount: { increment: 1 },
      },
    });
  }
}
