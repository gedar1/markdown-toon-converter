import { api } from "../lib/api";
import type { LiveStream, StreamStats, ApiResponse } from "../types";

export const liveService = {
  /**
   * Create a new live stream (Creator)
   */
  async createStream(data: {
    title: string;
    description?: string;
    scheduledFor?: string;
    recordingEnabled?: boolean;
  }): Promise<LiveStream> {
    const response = await api.post<ApiResponse<LiveStream>>(
      "/live/streams",
      data,
    );
    return response.data.data;
  },

  /**
   * Get creator's streams (Creator)
   */
  async getMyStreams(status?: string): Promise<LiveStream[]> {
    const params = status ? { status } : {};
    const response = await api.get<ApiResponse<LiveStream[]>>(
      "/live/streams/my",
      { params },
    );
    return response.data.data;
  },

  /**
   * Get active streams (Subscriber)
   */
  async getActiveStreams(): Promise<LiveStream[]> {
    const response = await api.get<ApiResponse<LiveStream[]>>(
      "/live/streams/active",
    );
    return response.data.data;
  },

  /**
   * Get stream by ID
   */
  async getStream(streamId: string): Promise<LiveStream> {
    const response = await api.get<ApiResponse<LiveStream>>(
      `/live/streams/${streamId}`,
    );
    return response.data.data;
  },

  /**
   * Update stream (Creator)
   */
  async updateStream(
    streamId: string,
    data: { title?: string; description?: string },
  ): Promise<LiveStream> {
    const response = await api.put<ApiResponse<LiveStream>>(
      `/live/streams/${streamId}`,
      data,
    );
    return response.data.data;
  },

  /**
   * End stream (Creator)
   */
  async endStream(streamId: string): Promise<LiveStream> {
    const response = await api.post<ApiResponse<LiveStream>>(
      `/live/streams/${streamId}/end`,
    );
    return response.data.data;
  },

  /**
   * Delete stream (Creator)
   */
  async deleteStream(streamId: string): Promise<void> {
    await api.delete(`/live/streams/${streamId}`);
  },

  /**
   * Check access to stream (Subscriber)
   */
  async checkAccess(streamId: string): Promise<{ hasAccess: boolean }> {
    const response = await api.get<ApiResponse<{ hasAccess: boolean }>>(
      `/live/streams/${streamId}/access`,
    );
    return response.data.data;
  },

  /**
   * Join stream (Subscriber)
   */
  async joinStream(streamId: string): Promise<void> {
    await api.post(`/live/streams/${streamId}/join`);
  },

  /**
   * Leave stream (Subscriber)
   */
  async leaveStream(streamId: string): Promise<void> {
    await api.post(`/live/streams/${streamId}/leave`);
  },

  /**
   * Get stream statistics
   */
  async getStreamStats(streamId: string): Promise<StreamStats> {
    const response = await api.get<ApiResponse<StreamStats>>(
      `/live/streams/${streamId}/stats`,
    );
    return response.data.data;
  },
};
