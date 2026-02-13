import { UserType } from '@prisma/client';

/**
 * User credentials for registration
 */
export interface UserCredentials {
  email: string;
  password: string;
  userType: UserType;
  profile: UserProfile;
}

/**
 * Login credentials
 */
export interface LoginCredentials {
  email: string;
  password: string;
}

/**
 * User profile information
 */
export interface UserProfile {
  displayName: string;
  bio?: string;
  avatarUrl?: string;
}

/**
 * Authentication token response
 */
export interface AuthToken {
  token: string;
  expiresAt: Date;
  userId: string;
  userType: UserType;
}

/**
 * Authentication result (includes user data)
 */
export interface AuthResult {
  token: string;
  expiresAt: Date;
  user: {
    id: string;
    email: string;
    userType: UserType;
    displayName: string;
    bio: string | null;
    avatarUrl: string | null;
    createdAt: Date;
  };
  profile: any; // CreatorProfile or SubscriberProfile
}

/**
 * Token validation result
 */
export interface TokenValidation {
  valid: boolean;
  userId?: string;
  userType?: UserType;
  email?: string;
}

/**
 * Password change request
 */
export interface PasswordChangeRequest {
  userId: string;
  oldPassword: string;
  newPassword: string;
}

/**
 * Password reset request
 */
export interface PasswordResetRequest {
  email: string;
}
