/**
 * Access control types
 */

/**
 * Access code generation request
 */
export interface GenerateAccessCodeRequest {
  creatorId: string;
  paymentId: string;
  amount: number;
  currency: string;
  durationDays: number;
}

/**
 * Access code data
 */
export interface AccessCodeData {
  code: string;
  creatorId: string;
  paymentId: string;
  amount: number;
  currency: string;
  durationDays: number;
  expiresAt: Date | null;
  isRedeemed: boolean;
  redeemedBy: string | null;
  redeemedAt: Date | null;
  createdAt: Date;
  isValid: boolean;
}

/**
 * Redeem access code request
 */
export interface RedeemAccessCodeRequest {
  code: string;
  subscriberId: string;
}

/**
 * Redeem access code result
 */
export interface RedeemAccessCodeResult {
  success: boolean;
  accessGrantId: string;
  creatorId: string;
  expiresAt: Date | null;
}

/**
 * Validate access request
 */
export interface ValidateAccessRequest {
  subscriberId: string;
  creatorId: string;
}

/**
 * Validate access result
 */
export interface ValidateAccessResult {
  hasAccess: boolean;
  grantId?: string;
  expiresAt?: Date | null;
  isActive?: boolean;
}

/**
 * Payment webhook event types
 */
export type PaymentEventType = 'payment.success' | 'payment.failed' | 'payment.refunded';

/**
 * Payment webhook payload
 */
export interface PaymentWebhookPayload {
  event: PaymentEventType;
  paymentId: string;
  amount: number;
  currency: string;
  creatorId: string;
  durationDays: number;
  idempotencyKey: string;
  timestamp: string;
}

/**
 * Invalidate access code request
 */
export interface InvalidateAccessCodeRequest {
  paymentId: string;
  reason: string;
}
