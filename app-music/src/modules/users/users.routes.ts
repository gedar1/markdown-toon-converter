import { Router } from 'express';
import { usersController } from './users.controller';
import {
  authenticate,
  authorizeCreator,
  authorizeSubscriber,
  optionalAuthenticate,
} from '../auth/auth.middleware';
import { asyncHandler } from '../../shared/errors/errorHandler';

const router = Router();

/**
 * Creator routes
 */

/**
 * @route   GET /creators
 * @desc    List all creators (discovery)
 * @access  Public (but shows access status if authenticated as subscriber)
 * @query   query, genres, sortBy, sortOrder, page, limit
 */
router.get(
  '/creators',
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
  '/creators/search',
  optionalAuthenticate,
  asyncHandler(usersController.searchCreators.bind(usersController))
);

/**
 * @route   GET /creators/:id
 * @desc    Get creator profile by ID
 * @access  Public
 */
router.get('/creators/:id', asyncHandler(usersController.getCreatorProfile.bind(usersController)));

/**
 * @route   PUT /creators/:id
 * @desc    Update creator profile
 * @access  Private (creator only, own profile)
 * @body    { displayName?, bio?, avatarUrl?, genres? }
 */
router.put(
  '/creators/:id',
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
  '/creators/:id/subscribers',
  authenticate,
  authorizeCreator,
  asyncHandler(usersController.getCreatorSubscribers.bind(usersController))
);

/**
 * Subscriber routes
 */

/**
 * @route   GET /subscribers/:id
 * @desc    Get subscriber profile by ID
 * @access  Public
 */
router.get(
  '/subscribers/:id',
  asyncHandler(usersController.getSubscriberProfile.bind(usersController))
);

/**
 * @route   PUT /subscribers/:id
 * @desc    Update subscriber profile
 * @access  Private (subscriber only, own profile)
 * @body    { displayName?, bio?, avatarUrl? }
 */
router.put(
  '/subscribers/:id',
  authenticate,
  authorizeSubscriber,
  asyncHandler(usersController.updateSubscriberProfile.bind(usersController))
);

/**
 * @route   GET /subscribers/:id/access
 * @desc    Get subscriber's access list (creators they have access to)
 * @access  Private (subscriber only, own access list)
 */
router.get(
  '/subscribers/:id/access',
  authenticate,
  authorizeSubscriber,
  asyncHandler(usersController.getSubscriberAccessList.bind(usersController))
);

export default router;
