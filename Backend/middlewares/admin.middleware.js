import { User } from '../models/User.js';

export const isAdmin = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId);

    if (user && user.role === 'admin') {
      return next();
    }

    return res.status(403).json({ message: 'Access denied. Requires Admin role.' });
  } catch (error) {
    return res.status(500).json({ message: 'Something went wrong.', error: error.message });
  }
};
