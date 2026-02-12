import { api } from "../lib/api";
import type { AccessCode, AccessGrant, ApiResponse } from "../types";

export const accessService = {
  /**
   * Redeem access code
   */
  async redeemAccessCode(code: string): Promise<AccessGrant> {
    const response = await api.post<ApiResponse<AccessGrant>>(
      "/access/redeem",
      { code },
    );
    return response.data.data;
  },

  /**
   * Validate access to creator
   */
  async validateAccess(
    creatorId: string,
  ): Promise<{ hasAccess: boolean; grant?: AccessGrant }> {
    const response = await api.get<
      ApiResponse<{ hasAccess: boolean; grant?: AccessGrant }>
    >(`/access/validate/${creatorId}`);
    return response.data.data;
  },

  /**
   * Get access code details
   */
  async getAccessCode(code: string): Promise<AccessCode> {
    const response = await api.get<ApiResponse<AccessCode>>(
      `/access/code/${code}`,
    );
    return response.data.data;
  },

  /**
   * Get subscriber access list
   */
  async getSubscriberAccessList(subscriberId: string): Promise<AccessGrant[]> {
    const response = await api.get<ApiResponse<AccessGrant[]>>(
      `/subscribers/${subscriberId}/access`,
    );
    return response.data.data;
  },
};
