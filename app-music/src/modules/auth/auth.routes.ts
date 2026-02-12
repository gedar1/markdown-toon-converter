import { Router } from 'express';
import { authController } from './auth.controller';
import { authenticate } from './auth.middleware';
import { asyncHandler } from '../../shared/errors/errorHandler';

/**
 * Authentication routes
 * Base path: /auth
 */
const router = Router();

/**
 * @route   POST /auth/register
 * @desc    Register a new user (creator or subscriber)
 * @access  Public
 * @body    { email, password, userType, profile: { displayName, bio?, avatarUrl? } }
 */
router.post('/register', asyncHandler(authController.register.bind(authController)));

/**
 * @route   POST /auth/login
 * @desc    Login user and get JWT token
 * @access  Public
 * @body    { email, password }
 */
router.post('/login', asyncHandler(authController.login.bind(authController)));

/**
 * @route   GET /auth/me
 * @desc    Get current authenticated user profile
 * @access  Private (requires authentication)
 * @header  Authorization: Bearer <token>
 */
router.get('/me', authenticate, asyncHandler(authController.getCurrentUser.bind(authController)));

/**
 * @route   GET /auth/validate
 * @desc    Validate JWT token
 * @access  Private (requires authentication)
 * @header  Authorization: Bearer <token>
 */
router.get(
  '/validate',
  authenticate,
  asyncHandler(authController.validateToken.bind(authController))
);

/**
 * @route   POST /auth/change-password
 * @desc    Change user password
 * @access  Private (requires authentication)
 * @header  Authorization: Bearer <token>
 * @body    { oldPassword, newPassword }
 */
router.post(
  '/change-password',
  authenticate,
  asyncHandler(authController.changePassword.bind(authController))
);

/**
 * @route   POST /auth/reset-password
 * @desc    Request password reset (sends email with reset link)
 * @access  Public
 * @body    { email }
 */
router.post('/reset-password', asyncHandler(authController.resetPassword.bind(authController)));

/**
 * @route   POST /auth/logout
 * @desc    Logout user (client-side token removal)
 * @access  Public (but logs authenticated user if present)
 * @header  Authorization: Bearer <token> (optional)
 */
router.post('/logout', asyncHandler(authController.logout.bind(authController)));

export default router;
