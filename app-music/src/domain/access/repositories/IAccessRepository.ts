/**
 * Access Code entity
 */
export interface AccessCode {
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
  isValid: boolean;
  createdAt: Date;
}

/**
 * Access Grant entity
 */
export interface AccessGrant {
  id: string;
  subscriberId: string;
  creatorId: string;
  accessCode: string;
  expiresAt: Date | null;
  isActive: boolean;
  revokedAt: Date | null;
  revokedBy: string | null;
  grantedAt: Date;
}

/**
 * Repository interface for Access operations (PORT)
 */
export interface IAccessRepository {
  /**
   * Find access code by code string
   */
  findAccessCodeByCode(code: string): Promise<AccessCode | null>;

  /**
   * Find access code by payment ID
   */
  findAccessCodeByPaymentId(paymentId: string): Promise<AccessCode | null>;

  /**
   * Create access code
   */
  createAccessCode(data: {
    code: string;
    creatorId: string;
    paymentId: string;
    amount: number;
    currency: string;
    durationDays: number;
    expiresAt: Date | null;
  }): Promise<AccessCode>;

  /**
   * Update access code
   */
  updateAccessCode(code: string, data: Partial<AccessCode>): Promise<AccessCode>;

  /**
   * Find active access grant
   */
  findActiveGrant(subscriberId: string, creatorId: string): Promise<AccessGrant | null>;

  /**
   * Find access grant by ID
   */
  findGrantById(grantId: string): Promise<AccessGrant | null>;

  /**
   * Create access grant and update profiles
   */
  createAccessGrant(data: {
    subscriberId: string;
    creatorId: string;
    accessCode: string;
    expiresAt: Date;
  }): Promise<AccessGrant>;

  /**
   * Revoke access grant and update profiles
   */
  revokeAccessGrant(grantId: string, revokedBy: string): Promise<void>;

  /**
   * Invalidate access code and revoke grants
   */
  invalidateAccessCode(code: string, redeemedBy: string | null): Promise<void>;

  /**
   * Update access grant status
   */
  updateGrantStatus(grantId: string, isActive: boolean): Promise<void>;

  /**
   * Find all grants by subscriber ID
   */
  findGrantsBySubscriber(subscriberId: string): Promise<AccessGrant[]>;
}
