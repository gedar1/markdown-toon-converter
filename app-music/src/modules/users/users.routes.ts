import { Router } from 'express';
import { usersController } from './users.controller';
import { authenticate, authorizeCreator, optionalAuthenticate } from '../auth/auth.middleware';
import { asyncHandler } from '../../shared/errors/errorHandler';

const router = Router();

/**
 * Creator routes (mounted at /creators in app.ts)
 */

/**
 * @route   GET /creators
 * @desc    List all creators (discovery)
 * @access  Public (but shows access status if authenticated as subscriber)
 * @query   query, genres, sortBy, sortOrder, page, limit
 */
router.get(
  '/',
  optionalAuthenticate,
  asyncHandler(usersController.listCreators.bind(usersController))
);

/**
 * @route   GET /creators/search
 * @desc    Search creators by query
 * @access  Public (but shows access status if authenticated as subscriber)
 * @query   q (search query)
 */
router.get(
  '/search',
  optionalAuthenticate,
  asyncHandler(usersController.searchCreators.bind(usersController))
);

/**
 * @route   GET /creators/:id
 * @desc    Get creator profile by ID
 * @access  Public
 */
router.get('/:id', asyncHandler(usersController.getCreatorProfile.bind(usersController)));

/**
 * @route   PUT /creators/:id
 * @desc    Update creator profile
 * @access  Private (creator only, own profile)
 * @body    { displayName?, bio?, avatarUrl?, genres? }
 */
router.put(
  '/:id',
  authenticate,
  authorizeCreator,
  asyncHandler(usersController.updateCreatorProfile.bind(usersController))
);

/**
 * @route   GET /creators/:id/subscribers
 * @desc    Get creator's subscribers list
 * @access  Private (creator only, own subscribers)
 */
router.get(
  '/:id/subscribers',
  authenticate,
  authorizeCreator,
  asyncHandler(usersController.getCreatorSubscribers.bind(usersController))
);

export default router;
