import { Router } from 'express';
import { usersController } from './users.controller';
import { authenticate, authorizeSubscriber } from '../auth/auth.middleware';
import { asyncHandler } from '../../shared/errors/errorHandler';

const router = Router();

/**
 * Subscriber routes (mounted at /subscribers in app.ts)
 */

/**
 * @route   GET /subscribers/:id
 * @desc    Get subscriber profile by ID
 * @access  Public
 */
router.get('/:id', asyncHandler(usersController.getSubscriberProfile.bind(usersController)));

/**
 * @route   PUT /subscribers/:id
 * @desc    Update subscriber profile
 * @access  Private (subscriber only, own profile)
 * @body    { displayName?, bio?, avatarUrl? }
 */
router.put(
  '/:id',
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
  '/:id/access',
  authenticate,
  authorizeSubscriber,
  asyncHandler(usersController.getSubscriberAccessList.bind(usersController))
);

export default router;
