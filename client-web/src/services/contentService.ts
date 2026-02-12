import { api } from "../lib/api";
import type {
  Content,
  Playlist,
  ApiResponse,
  PaginatedResponse,
} from "../types";

export const contentService = {
  /**
   * Upload content
   */
  async uploadContent(formData: FormData): Promise<Content> {
    const response = await api.post<ApiResponse<Content>>(
      "/content",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      },
    );
    return response.data.data;
  },

  /**
   * Get content by ID
   */
  async getContent(contentId: string): Promise<Content> {
    const response = await api.get<ApiResponse<Content>>(
      `/content/${contentId}`,
    );
    return response.data.data;
  },

  /**
   * Update content
   */
  async updateContent(
    contentId: string,
    data: Partial<Content>,
  ): Promise<Content> {
    const response = await api.put<ApiResponse<Content>>(
      `/content/${contentId}`,
      data,
    );
    return response.data.data;
  },

  /**
   * Delete content
   */
  async deleteContent(contentId: string): Promise<void> {
    await api.delete(`/content/${contentId}`);
  },

  /**
   * Get creator library
   */
  async getCreatorLibrary(creatorId: string): Promise<Content[]> {
    const response = await api.get<ApiResponse<Content[]>>(
      `/creators/${creatorId}/library`,
    );
    return response.data.data;
  },

  /**
   * Create playlist
   */
  async createPlaylist(data: {
    title: string;
    description?: string;
    isPublic?: boolean;
  }): Promise<Playlist> {
    const response = await api.post<ApiResponse<Playlist>>("/playlists", data);
    return response.data.data;
  },

  /**
   * Get playlist
   */
  async getPlaylist(
    playlistId: string,
  ): Promise<Playlist & { content: Content[] }> {
    const response = await api.get<
      ApiResponse<Playlist & { content: Content[] }>
    >(`/playlists/${playlistId}`);
    return response.data.data;
  },

  /**
   * Update playlist
   */
  async updatePlaylist(
    playlistId: string,
    data: Partial<Playlist>,
  ): Promise<Playlist> {
    const response = await api.put<ApiResponse<Playlist>>(
      `/playlists/${playlistId}`,
      data,
    );
    return response.data.data;
  },

  /**
   * Delete playlist
   */
  async deletePlaylist(playlistId: string): Promise<void> {
    await api.delete(`/playlists/${playlistId}`);
  },

  /**
   * Get creator playlists
   */
  async getCreatorPlaylists(creatorId: string): Promise<Playlist[]> {
    const response = await api.get<ApiResponse<Playlist[]>>(
      `/creators/${creatorId}/playlists`,
    );
    return response.data.data;
  },

  /**
   * Add content to playlist
   */
  async addContentToPlaylist(
    playlistId: string,
    contentId: string,
  ): Promise<void> {
    await api.post(`/playlists/${playlistId}/content`, { contentId });
  },

  /**
   * Remove content from playlist
   */
  async removeContentFromPlaylist(
    playlistId: string,
    contentId: string,
  ): Promise<void> {
    await api.delete(`/playlists/${playlistId}/content/${contentId}`);
  },
};
