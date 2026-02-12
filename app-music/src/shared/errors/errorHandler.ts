import { Request, Response, NextFunction } from 'express';
import { AppError } from './AppError';
import { logger } from '../utils/logger';

/**
 * Error response format
 */
interface ErrorResponse {
  status: 'error';
  code: string;
  message: string;
  details?: Record<string, any>;
  timestamp: string;
  path?: string;
}

/**
 * Global error handler middleware
 */
export function errorHandler(err: Error, req: Request, res: Response, _next: NextFunction): void {
  // Default error values
  let statusCode = 500;
  let code = 'INTERNAL_SERVER_ERROR';
  let message = 'An unexpected error occurred';
  let details: Record<string, any> | undefined;

  // Handle AppError instances
  if (err instanceof AppError) {
    statusCode = err.statusCode;
    code = err.code;
    message = err.message;
    details = err.details;

    // Log operational errors as warnings
    if (err.isOperational) {
      logger.warn('Operational error', {
        code: err.code,
        message: err.message,
        statusCode: err.statusCode,
        path: req.path,
        method: req.method,
        details: err.details,
      });
    } else {
      // Log non-operational errors as errors
      logger.error('Non-operational error', {
        error: err,
        stack: err.stack,
        path: req.path,
        method: req.method,
      });
    }
  } else {
    // Handle unexpected errors
    logger.error('Unexpected error', {
      error: err,
      stack: err.stack,
      path: req.path,
      method: req.method,
    });
  }

  // Build error response
  const errorResponse: ErrorResponse = {
    status: 'error',
    code,
    message,
    timestamp: new Date().toISOString(),
    path: req.path,
  };

  // Include details in development mode
  if (process.env.NODE_ENV === 'development' && details) {
    errorResponse.details = details;
  }

  // Send error response
  res.status(statusCode).json(errorResponse);
}

/**
 * Handle 404 errors for undefined routes
 */
export function notFoundHandler(req: Request, res: Response): void {
  const errorResponse: ErrorResponse = {
    status: 'error',
    code: 'ROUTE_NOT_FOUND',
    message: `Route ${req.method} ${req.path} not found`,
    timestamp: new Date().toISOString(),
    path: req.path,
  };

  res.status(404).json(errorResponse);
}

/**
 * Async handler wrapper to catch errors in async route handlers
 */
export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}
