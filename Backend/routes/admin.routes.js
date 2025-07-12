import express from 'express';
import { verifyToken } from '../middlewares/auth.middleware.js';
import { isAdmin } from '../middlewares/admin.middleware.js';
import {
  getAllStacksAdmin,
  deleteStackAdmin,
  deleteCommentAdmin,
  listUsers,
  updateUserRole,
  updateUserStatus,
  lockStack,
  pinStack,
  getModerationLogs,
} from '../controllers/admin.controller.js';

const router = express.Router();

// Apply admin middleware to all routes in this file
router.use(verifyToken, isAdmin);

/* --- CONTENT MANAGEMENT --- */
router.get('/stacks', getAllStacksAdmin);
router.delete('/stacks/:id', deleteStackAdmin);
router.delete('/comments/:id', deleteCommentAdmin);
router.patch('/stacks/:stackId/lock', lockStack);
router.patch('/stacks/:stackId/pin', pinStack);

/* --- USER MANAGEMENT --- */
router.get('/users', listUsers);
router.patch('/users/:userId/role', updateUserRole);
router.patch('/users/:userId/status', updateUserStatus);

/* --- LOGS --- */
router.get('/logs', getModerationLogs);

export default router;
