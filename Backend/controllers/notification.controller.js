import { Notification } from '../models/Notification.js';

// @desc    Get all notifications for the logged-in user
// @route   GET /api/notifications
// @access  Private
export const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ recipient: req.userId })
      .populate('sender', 'username')
      .populate('stack', 'title')
      .sort({ createdAt: -1 });

    res.status(200).json(notifications);
  } catch (error) {
    res.status(500).json({ message: 'Something went wrong.', error: error.message });
  }
};

// @desc    Mark all notifications as read
// @route   POST /api/notifications/read
// @access  Private
export const markNotificationsAsRead = async (req, res) => {
  try {
    await Notification.updateMany({ recipient: req.userId, isRead: false }, { isRead: true });
    res.status(200).json({ message: 'All notifications marked as read.' });
  } catch (error) {
    res.status(500).json({ message: 'Something went wrong.', error: error.message });
  }
};
