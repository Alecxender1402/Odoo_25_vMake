import { ModerationLog } from '../models/ModerationLog.js';

export const logAdminAction = async (adminId, action, details = {}) => {
  try {
    const log = new ModerationLog({
      admin: adminId,
      action,
      ...details
    });
    
    await log.save();
    console.log(`Admin action logged: ${action} by ${adminId}`);
    return log;
  } catch (error) {
    console.error('Error logging admin action:', error);
    throw error;
  }
};
