import express from 'express';
import {
  getAllStacks,
  getStackById,
  createStack,
  upvoteStack,
  addComment,
} from '../controllers/stack.controller.js';
import { verifyToken } from '../middlewares/auth.middleware.js';

const router = express.Router();

/* --- PUBLIC ROUTES --- */
// Anyone can view all stacks or a single stack
router.get('/', getAllStacks);
router.get('/:id', getStackById);

/* --- PRIVATE ROUTES --- */
// Only logged-in users can create, vote, or comment
router.post('/', verifyToken, createStack);
router.post('/:id/vote', verifyToken, upvoteStack);
router.post('/:id/comments', verifyToken, addComment);

export default router;
