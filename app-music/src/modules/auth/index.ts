/**
 * Authentication module exports
 */

export { authService, AuthService } from '../../application/auth/AuthService';
export { authController, AuthController } from './auth.controller';
export {
  authenticate,
  authorizeUserType,
  authorizeCreator,
  authorizeSubscriber,
  optionalAuthenticate,
  AuthenticatedRequest,
} from './auth.middleware';
export { default as authRoutes } from './auth.routes';
export * from './auth.types';
