import express from 'express';
import {
  getUserProfile,
  getStacksByUser,
  getCommentsByUser,
} from '../controllers/user.controller.js';

const router = express.Router();

/* --- PUBLIC ROUTES --- */
router.get('/:userId', getUserProfile);
router.get('/:userId/stacks', getStacksByUser);
router.get('/:userId/comments', getCommentsByUser);

export default router;
