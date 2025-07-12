import express from 'express';
import {
  getNotifications,
  markNotificationsAsRead,
} from '../controllers/notification.controller.js';
import { authenticateToken } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.get('/', authenticateToken, getNotifications);
router.post('/read', authenticateToken, markNotificationsAsRead);

export default router;
