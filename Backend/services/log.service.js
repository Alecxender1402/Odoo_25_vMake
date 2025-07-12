import { ModerationLog } from '../models/ModerationLog.js';

export const logAdminAction = async (adminId, action, details = {}) => {
  try {
    await ModerationLog.create({
      admin: adminId,
      action,
      ...details,
    });
  } catch (error) {
    console.error('Failed to log admin action:', error);
  }
};
