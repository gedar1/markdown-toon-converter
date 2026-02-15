/**
 * Payment types and interfaces
 */

export interface CreateCheckoutRequest {
  creatorId: string;
  priceId?: string; // Optional: Use predefined Stripe price
  customAmount?: number; // Optional: Custom amount in cents
  durationDays?: number; // Default: 30
}

export interface CheckoutSession {
  sessionId: string;
  url: string;
  expiresAt: Date;
}

export interface PaymentWebhookEvent {
  type: string;
  data: {
    object: any;
  };
}

export interface SubscriptionPlan {
  id: string;
  creatorId: string;
  name: string;
  description: string;
  amount: number; // in cents
  currency: string;
  durationDays: number;
  stripePriceId: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
