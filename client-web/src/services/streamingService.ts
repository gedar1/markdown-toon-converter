import { api } from "../lib/api";
import type { StreamSession, ApiResponse } from "../types";

export const streamingService = {
  /**
   * Initialize stream session
   */
  async initializeStream(
    contentId: string,
  ): Promise<{ sessionId: string; manifestUrl: string }> {
    const response = await api.post<
      ApiResponse<{ sessionId: string; manifestUrl: string }>
    >("/stream/init", { contentId });
    return response.data.data;
  },

  /**
   * Get stream manifest URL
   */
  getManifestUrl(sessionId: string): string {
    const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3000";
    return `${apiUrl}/stream/${sessionId}/manifest.m3u8`;
  },

  /**
   * End stream session
   */
  async endStream(sessionId: string): Promise<StreamSession> {
    const response = await api.post<ApiResponse<StreamSession>>(
      `/stream/${sessionId}/end`,
    );
    return response.data.data;
  },

  /**
   * Get stream session details
   */
  async getStreamSession(sessionId: string): Promise<StreamSession> {
    const response = await api.get<ApiResponse<StreamSession>>(
      `/stream/session/${sessionId}`,
    );
    return response.data.data;
  },

  /**
   * Get creator analytics
   */
  async getCreatorAnalytics(creatorId: string): Promise<{
    totalStreams: number;
    totalDuration: number;
    totalBytes: number;
    contentStats: Array<{
      contentId: string;
      title: string;
      streams: number;
      duration: number;
    }>;
  }> {
    const response = await api.get<
      ApiResponse<{
        totalStreams: number;
        totalDuration: number;
        totalBytes: number;
        contentStats: Array<{
          contentId: string;
          title: string;
          streams: number;
          duration: number;
        }>;
      }>
    >(`/stream/analytics/creator/${creatorId}`);
    return response.data.data;
  },

  /**
   * Get subscriber history
   */
  async getSubscriberHistory(subscriberId: string): Promise<StreamSession[]> {
    const response = await api.get<ApiResponse<StreamSession[]>>(
      `/stream/history/subscriber/${subscriberId}`,
    );
    return response.data.data;
  },
};
