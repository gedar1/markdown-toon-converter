/**
 * Common types used across the application
 */

/**
 * User type enum
 */
export type UserType = 'creator' | 'subscriber';

/**
 * API response wrapper for success
 */
export interface SuccessResponse<T = any> {
  status: 'success';
  data: T;
  message?: string;
  timestamp: string;
}

/**
 * API response wrapper for errors
 */
export interface ErrorResponse {
  status: 'error';
  code: string;
  message: string;
  details?: Record<string, any>;
  timestamp: string;
  path?: string;
}

/**
 * Pagination parameters
 */
export interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

/**
 * Paginated response
 */
export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

/**
 * Filter options for queries
 */
export interface FilterOptions {
  [key: string]: any;
}

/**
 * Sort options
 */
export interface SortOptions {
  field: string;
  order: 'asc' | 'desc';
}

/**
 * Date range filter
 */
export interface DateRange {
  from: Date;
  to: Date;
}

/**
 * File upload metadata
 */
export interface FileMetadata {
  originalName: string;
  mimeType: string;
  size: number;
  path: string;
  url: string;
}

/**
 * Request with authenticated user
 */
export interface AuthenticatedRequest {
  userId: string;
  userType: UserType;
  email: string;
}

/**
 * Generic ID parameter
 */
export interface IdParam {
  id: string;
}

/**
 * Generic query result
 */
export interface QueryResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * Async operation result
 */
export type AsyncResult<T, E = Error> = Promise<
  { success: true; data: T } | { success: false; error: E }
>;

/**
 * Environment variables type
 */
export interface EnvironmentVariables {
  NODE_ENV: 'development' | 'production' | 'test';
  PORT: number;
  HOST: string;
  DATABASE_URL: string;
  JWT_SECRET: string;
  JWT_EXPIRES_IN: string;
  UPLOAD_DIR: string;
  MAX_FILE_SIZE: number;
  ALLOWED_AUDIO_FORMATS: string;
  CORS_ORIGIN: string;
  LOG_LEVEL: string;
  PAYMENT_WEBHOOK_SECRET?: string;
}
