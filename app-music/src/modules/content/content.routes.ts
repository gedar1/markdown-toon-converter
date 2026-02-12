import { Router } from 'express';
import multer from 'multer';
import { contentController } from './content.controller';
import { authenticate, authorizeCreator, optionalAuthenticate } from '../auth/auth.middleware';
import { asyncHandler } from '../../shared/errors/errorHandler';

const router = Router();

// Configure multer for file uploads (memory storage)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB
  },
  fileFilter: (req, file, cb) => {
    const allowedMimes = ['audio/mpeg', 'audio/wav', 'audio/flac', 'audio/mp3'];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only MP3, WAV, and FLAC are allowed.'));
    }
  },
});

/**
 * Content routes
 */

/**
 * @route   POST /content
 * @desc    Upload new content
 * @access  Private (creator only)
 */
router.post(
  '/',
  authenticate,
  authorizeCreator,
  upload.single('audio'),
  asyncHandler(contentController.uploadContent.bind(contentController))
);

/**
 * @route   GET /content/:id
 * @desc    Get content by ID
 * @access  Public (but requires access for subscriber)
 */
router.get(
  '/:id',
  optionalAuthenticate,
  asyncHandler(contentController.getContent.bind(contentController))
);

/**
 * @route   PUT /content/:id
 * @desc    Update content metadata
 * @access  Private (creator only, own content)
 */
router.put(
  '/:id',
  authenticate,
  authorizeCreator,
  asyncHandler(contentController.updateContent.bind(contentController))
);

/**
 * @route   DELETE /content/:id
 * @desc    Delete content
 * @access  Private (creator only, own content)
 */
router.delete(
  '/:id',
  authenticate,
  authorizeCreator,
  asyncHandler(contentController.deleteContent.bind(contentController))
);

/**
 * @route   GET /content/creator/:creatorId
 * @desc    Get creator's library
 * @access  Public
 */
router.get(
  '/creator/:creatorId',
  asyncHandler(contentController.getCreatorLibrary.bind(contentController))
);

/**
 * Playlist routes
 */

/**
 * @route   POST /playlists
 * @desc    Create new playlist
 * @access  Private (creator only)
 */
router.post(
  '/playlists',
  authenticate,
  authorizeCreator,
  asyncHandler(contentController.createPlaylist.bind(contentController))
);

/**
 * @route   GET /playlists/:id
 * @desc    Get playlist with content
 * @access  Public
 */
router.get('/playlists/:id', asyncHandler(contentController.getPlaylist.bind(contentController)));

/**
 * @route   PUT /playlists/:id
 * @desc    Update playlist
 * @access  Private (creator only, own playlist)
 */
router.put(
  '/playlists/:id',
  authenticate,
  authorizeCreator,
  asyncHandler(contentController.updatePlaylist.bind(contentController))
);

/**
 * @route   DELETE /playlists/:id
 * @desc    Delete playlist
 * @access  Private (creator only, own playlist)
 */
router.delete(
  '/playlists/:id',
  authenticate,
  authorizeCreator,
  asyncHandler(contentController.deletePlaylist.bind(contentController))
);

/**
 * @route   GET /playlists/creator/:creatorId
 * @desc    Get creator's playlists
 * @access  Public
 */
router.get(
  '/playlists/creator/:creatorId',
  asyncHandler(contentController.getCreatorPlaylists.bind(contentController))
);

/**
 * @route   POST /playlists/:id/content
 * @desc    Add content to playlist
 * @access  Private (creator only)
 */
router.post(
  '/playlists/:id/content',
  authenticate,
  authorizeCreator,
  asyncHandler(contentController.addContentToPlaylist.bind(contentController))
);

/**
 * @route   DELETE /playlists/:id/content/:contentId
 * @desc    Remove content from playlist
 * @access  Private (creator only)
 */
router.delete(
  '/playlists/:id/content/:contentId',
  authenticate,
  authorizeCreator,
  asyncHandler(contentController.removeContentFromPlaylist.bind(contentController))
);

export default router;
