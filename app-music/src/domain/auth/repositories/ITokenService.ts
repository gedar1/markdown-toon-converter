import { UserType } from '@prisma/client';

/**
 * Token payload
 */
export interface TokenPayload {
  userId: string;
  userType: UserType;
  email: string;
}

/**
 * Token service interface (PORT)
 */
export interface ITokenService {
  /**
   * Generate JWT token
   */
  generate(payload: TokenPayload): string;

  /**
   * Verify and decode JWT token
   */
  verify(token: string): TokenPayload;
}
