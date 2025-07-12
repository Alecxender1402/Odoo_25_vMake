import express from 'express';
import { 
  createStack, 
  getAllStacks, 
  getStackById, 
  updateStack, 
  deleteStack,
  getComments,
  createComment,
  getAvailableTags,
  markAsSolution,
  voteOnStack,
  voteOnComment
} from '../controllers/stack.controller.js';
import { authenticateToken, optionalAuth } from '../middlewares/auth.middleware.js';

const router = express.Router();

// Public routes (no authentication required)
router.get('/', optionalAuth, getAllStacks);
router.get('/tags', getAvailableTags);
router.get('/:id', optionalAuth, getStackById);
router.get('/:id/comments', optionalAuth, getComments);

// Protected routes (authentication required)
router.post('/', authenticateToken, createStack);
router.put('/:id', authenticateToken, updateStack);
router.delete('/:id', authenticateToken, deleteStack);
router.post('/:id/comments', authenticateToken, createComment);
router.post('/:stackId/comments/:commentId/solution', authenticateToken, markAsSolution);
router.post('/:id/vote', authenticateToken, voteOnStack);
router.post('/:stackId/comments/:commentId/vote', authenticateToken, voteOnComment);

export default router;
