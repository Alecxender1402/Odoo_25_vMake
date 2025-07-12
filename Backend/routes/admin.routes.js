import express from 'express';
import {
  deleteStackAdmin,
  getAllStacksAdmin,
  listUsers,
  updateUserStatus,
  promoteToAdmin,
  getModerationLogs,
  lockStack,
  pinStack
} from '../controllers/admin.controller.js';
import { authenticateToken, isAdmin } from '../middlewares/auth.middleware.js';

const router = express.Router();

// All admin routes require authentication and admin role
router.use(authenticateToken);
router.use(isAdmin);

// Stack management
router.get('/stacks', getAllStacksAdmin);
router.delete('/stacks/:id', deleteStackAdmin);
router.patch('/stacks/:stackId/lock', lockStack);
router.patch('/stacks/:stackId/pin', pinStack);

// User management
router.get('/users', listUsers);
router.patch('/users/:userId/status', updateUserStatus);
router.patch('/users/:userId/promote', promoteToAdmin);

// Logs
router.get('/logs', getModerationLogs);

export default router;
