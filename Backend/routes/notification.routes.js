import express from 'express';
import {
  getNotifications,
  markNotificationsAsRead,
} from '../controllers/notification.controller.js';
import { verifyToken } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.get('/', verifyToken, getNotifications);
router.post('/read', verifyToken, markNotificationsAsRead);

export default router;
