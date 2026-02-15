import { UserType } from '@prisma/client';

/**
 * User entity from domain perspective
 */
export interface User {
  id: string;
  email: string;
  passwordHash: string;
  userType: UserType;
  displayName: string;
  bio: string | null;
  avatarUrl: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * User profile (creator or subscriber)
 */
export interface UserProfile {
  userId: string;
  updatedAt: Date;
  [key: string]: any;
}

/**
 * Repository interface (PORT)
 * This is the contract that infrastructure must implement
 */
export interface IUserRepository {
  /**
   * Find user by email
   */
  findByEmail(email: string): Promise<User | null>;

  /**
   * Find user by ID
   */
  findById(id: string): Promise<User | null>;

  /**
   * Create a new user with profile
   */
  create(data: {
    email: string;
    passwordHash: string;
    userType: UserType;
    displayName: string;
    bio?: string;
    avatarUrl?: string;
  }): Promise<{ user: User; profile: UserProfile }>;

  /**
   * Update user password
   */
  updatePassword(userId: string, passwordHash: string): Promise<void>;

  /**
   * Get user profile (creator or subscriber)
   */
  getProfile(userId: string, userType: UserType): Promise<UserProfile | null>;
}
