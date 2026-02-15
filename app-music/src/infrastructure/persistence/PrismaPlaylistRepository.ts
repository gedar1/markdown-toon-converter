import { prisma } from '../../shared/database/client';
import {
  IPlaylistRepository,
  Playlist,
  PlaylistWithCount,
} from '../../domain/content/repositories/IPlaylistRepository';

/**
 * Prisma implementation of IPlaylistRepository (ADAPTER)
 *
 * EXTRACCIÓN: Implementación real con Prisma para Playlists
 * UBICACIÓN: infrastructure/persistence/
 */
export class PrismaPlaylistRepository implements IPlaylistRepository {
  async create(data: {
    creatorId: string;
    name: string;
    description: string | null;
    coverArtUrl: string | null;
  }): Promise<Playlist> {
    return await prisma.playlist.create({
      data: {
        ...data,
        isActive: true,
      },
    });
  }

  async findById(playlistId: string): Promise<Playlist | null> {
    return await prisma.playlist.findUnique({
      where: { id: playlistId },
    });
  }

  async update(playlistId: string, data: Partial<Playlist>): Promise<Playlist> {
    return await prisma.playlist.update({
      where: { id: playlistId },
      data,
    });
  }

  async delete(playlistId: string): Promise<void> {
    await prisma.playlist.delete({
      where: { id: playlistId },
    });
  }

  async getCreatorPlaylists(creatorId: string): Promise<PlaylistWithCount[]> {
    const playlists = await prisma.playlist.findMany({
      where: { creatorId, isActive: true },
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { playlistContent: true },
        },
      },
    });

    return playlists.map((p) => ({
      id: p.id,
      creatorId: p.creatorId,
      name: p.name,
      description: p.description,
      coverArtUrl: p.coverArtUrl,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
      isActive: p.isActive,
      contentCount: p._count.playlistContent,
    }));
  }

  async getContentCount(playlistId: string): Promise<number> {
    return await prisma.playlistContent.count({
      where: { playlistId },
    });
  }

  async addContent(playlistId: string, contentId: string, position: number): Promise<void> {
    await prisma.playlistContent.create({
      data: {
        playlistId,
        contentId,
        position,
      },
    });
  }

  async removeContent(playlistId: string, contentId: string): Promise<void> {
    await prisma.playlistContent.delete({
      where: {
        playlistId_contentId: {
          playlistId,
          contentId,
        },
      },
    });
  }

  async hasContent(playlistId: string, contentId: string): Promise<boolean> {
    const exists = await prisma.playlistContent.findUnique({
      where: {
        playlistId_contentId: {
          playlistId,
          contentId,
        },
      },
    });

    return !!exists;
  }

  async getNextPosition(playlistId: string): Promise<number> {
    const maxPosition = await prisma.playlistContent.findFirst({
      where: { playlistId },
      orderBy: { position: 'desc' },
      select: { position: true },
    });

    return (maxPosition?.position || 0) + 1;
  }

  async getWithContent(playlistId: string): Promise<{
    playlist: Playlist;
    content: Array<{ content: any; position: number }>;
  } | null> {
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
      return null;
    }

    return {
      playlist: {
        id: playlist.id,
        creatorId: playlist.creatorId,
        name: playlist.name,
        description: playlist.description,
        coverArtUrl: playlist.coverArtUrl,
        createdAt: playlist.createdAt,
        updatedAt: playlist.updatedAt,
        isActive: playlist.isActive,
      },
      content: playlist.playlistContent.map((pc) => ({
        content: pc.content,
        position: pc.position,
      })),
    };
  }
}
