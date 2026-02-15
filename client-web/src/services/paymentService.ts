import { api } from "../lib/api";
import type { ApiResponse } from "../types";

export interface CheckoutSession {
  sessionId: string;
  url: string;
  expiresAt: string;
}

export interface SubscriptionPlan {
  id: string;
  creatorId: string;
  name: string;
  description: string;
  amount: number;
  currency: string;
  durationDays: number;
  stripePriceId: string | null;
  isActive: boolean;
}

export const paymentService = {
  /**
   * Create checkout session
   */
  async createCheckout(data: {
    creatorId: string;
    customAmount?: number;
    durationDays?: number;
  }): Promise<CheckoutSession> {
    const response = await api.post<ApiResponse<CheckoutSession>>(
      "/payments/checkout",
      data,
    );
    return response.data.data;
  },

  /**
   * Get checkout session details
   */
  async getSession(sessionId: string): Promise<any> {
    const response = await api.get<ApiResponse<any>>(
      `/payments/session/${sessionId}`,
    );
    return response.data.data;
  },

  /**
   * Get creator's subscription plans
   */
  async getCreatorPlans(creatorId: string): Promise<SubscriptionPlan[]> {
    const response = await api.get<ApiResponse<SubscriptionPlan[]>>(
      `/payments/plans/${creatorId}`,
    );
    return response.data.data;
  },

  /**
   * Create subscription plan (creator only)
   */
  async createPlan(data: {
    name: string;
    description: string;
    amount: number;
    durationDays: number;
  }): Promise<SubscriptionPlan> {
    const response = await api.post<ApiResponse<SubscriptionPlan>>(
      "/payments/plans",
      data,
    );
    return response.data.data;
  },
};
