import { api } from "../lib/api";
import type {
  CreatorProfile,
  SubscriberProfile,
  ApiResponse,
  PaginatedResponse,
} from "../types";

export const userService = {
  /**
   * Get creator profile
   */
  async getCreatorProfile(creatorId: string): Promise<CreatorProfile> {
    const response = await api.get<ApiResponse<CreatorProfile>>(
      `/creators/${creatorId}`,
    );
    return response.data.data;
  },

  /**
   * Update creator profile
   */
  async updateCreatorProfile(
    creatorId: string,
    data: Partial<CreatorProfile>,
  ): Promise<CreatorProfile> {
    const response = await api.put<ApiResponse<CreatorProfile>>(
      `/creators/${creatorId}`,
      data,
    );
    return response.data.data;
  },

  /**
   * Get subscriber profile
   */
  async getSubscriberProfile(subscriberId: string): Promise<SubscriberProfile> {
    const response = await api.get<ApiResponse<SubscriberProfile>>(
      `/subscribers/${subscriberId}`,
    );
    return response.data.data;
  },

  /**
   * Update subscriber profile
   */
  async updateSubscriberProfile(
    subscriberId: string,
    data: Partial<SubscriberProfile>,
  ): Promise<SubscriberProfile> {
    const response = await api.put<ApiResponse<SubscriberProfile>>(
      `/subscribers/${subscriberId}`,
      data,
    );
    return response.data.data;
  },

  /**
   * List creators (discovery)
   */
  async listCreators(params?: {
    page?: number;
    limit?: number;
    genre?: string;
    sortBy?: string;
  }): Promise<PaginatedResponse<CreatorProfile>> {
    const response = await api.get<
      ApiResponse<PaginatedResponse<CreatorProfile>>
    >("/creators", {
      params,
    });
    return response.data.data;
  },

  /**
   * Search creators
   */
  async searchCreators(query: string): Promise<CreatorProfile[]> {
    const response = await api.get<ApiResponse<CreatorProfile[]>>(
      "/creators/search",
      {
        params: { q: query },
      },
    );
    return response.data.data;
  },
};
