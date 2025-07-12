import { Stack } from '../models/Stack.js';
import { Comment } from '../models/Comment.js';
import { User } from '../models/User.js';

// @desc    Get a user's public profile information
// @route   GET /api/users/:userId
// @access  Public
export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }
    return res.status(200).json(user);
  } catch (error) {
    return res.status(500).json({ message: 'Something went wrong.', error: error.message });
  }
};

// @desc    Get all stacks created by a specific user
// @route   GET /api/users/:userId/stacks
// @access  Public
export const getStacksByUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const stacks = await Stack.find({ creator: userId })
      .populate('creator', 'username')
      .sort({ createdAt: -1 });

    return res.status(200).json(stacks);
  } catch (error) {
    return res.status(500).json({ message: 'Something went wrong.', error: error.message });
  }
};

// @desc    Get all comments made by a specific user
// @route   GET /api/users/:userId/comments
// @access  Public
export const getCommentsByUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const comments = await Comment.find({ author: userId })
      .populate('stack', 'title') // Populate stack title for context
      .sort({ createdAt: -1 });

    return res.status(200).json(comments);
  } catch (error) {
    return res.status(500).json({ message: 'Something went wrong.', error: error.message });
  }
};
