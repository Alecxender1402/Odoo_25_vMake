import express from 'express';
import {
  getAllStacks,
  getStackById,
  createStack,
  voteOnStack,
  addComment,
  markAsSolution,
  voteOnComment,
} from '../controllers/stack.controller.js';
import { verifyToken } from '../middlewares/auth.middleware.js';

const router = express.Router();

/* --- PUBLIC ROUTES --- */
router.get('/', getAllStacks);
router.get('/:id', getStackById);

/* --- PRIVATE ROUTES --- */
router.post('/', verifyToken, createStack);
router.post('/:id/vote', verifyToken, voteOnStack);
router.post('/:id/comments', verifyToken, addComment);
router.post('/:id/solution', verifyToken, markAsSolution);
router.post('/:id/comment/vote', verifyToken, voteOnComment);

export default router;
