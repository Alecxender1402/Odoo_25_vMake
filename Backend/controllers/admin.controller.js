import { Stack } from '../models/Stack.js';
import { Comment } from '../models/Comment.js';
import { StackVote } from '../models/StackVote.js';
import { CommentVote } from '../models/CommentVote.js';
import { User } from '../models/User.js';
import { ModerationLog } from '../models/ModerationLog.js';
import { logAdminAction } from '../services/log.service.js';

// --- STACK MANAGEMENT --

// @desc    Get all stacks (for admin)
// @route   GET /api/admin/stacks
// @access  Admin
export const getAllStacksAdmin = async (req, res) => {
  try {
    const stacks = await Stack.find({}).populate('creator', 'username').sort({ createdAt: -1 });
    res.status(200).json(stacks);
  } catch (error) {
    res.status(500).json({ message: 'Something went wrong.', error: error.message });
  }
};

// @desc    Delete a stack and its related data (for admin)
// @route   DELETE /api/admin/stacks/:id
// @access  Admin
export const deleteStackAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const stack = await Stack.findById(id);
    if (!stack) return res.status(404).json({ message: 'Stack not found.' });

    await Comment.deleteMany({ _id: { $in: stack.comments } });
    await StackVote.deleteMany({ stack: id });
    await Stack.findByIdAndDelete(id);

    await logAdminAction(req.userId, 'delete_stack', { targetStack: id, reason: 'Admin deletion' });
    res.status(200).json({ message: 'Stack and all associated data deleted successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'Something went wrong.', error: error.message });
  }
};

// @desc    Delete a comment and its related data (for admin)
// @route   DELETE /api/admin/comments/:id
// @access  Admin
export const deleteCommentAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const comment = await Comment.findById(id);
    if (!comment) return res.status(404).json({ message: 'Comment not found.' });

    await CommentVote.deleteMany({ comment: id });
    await Stack.findByIdAndUpdate(comment.stack, { $pull: { comments: id } });
    await Comment.findByIdAndDelete(id);

    await logAdminAction(req.userId, 'delete_comment', {
      targetStack: comment.stack,
      reason: 'Admin deletion of comment',
    });
    res.status(200).json({ message: 'Comment and all associated data deleted successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'Something went wrong.', error: error.message });
  }
};

// --- USER MANAGEMENT ---

// @desc    List all users
// @route   GET /api/admin/users
// @access  Admin
export const listUsers = async (req, res) => {
  try {
    const users = await User.find({}).select('-password').sort({ createdAt: -1 });
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: 'Something went wrong.', error: error.message });
  }
};

// @desc    Update a user's role
// @route   PATCH /api/admin/users/:userId/role
// @access  Admin
export const updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    if (!['User', 'Admin'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role specified.' });
    }
    const user = await User.findByIdAndUpdate(req.params.userId, { role }, { new: true }).select(
      '-password'
    );
    if (!user) return res.status(404).json({ message: 'User not found.' });

    await logAdminAction(req.userId, 'update_user_role', {
      targetUser: user._id,
      reason: `Set role to ${role}`,
    });
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: 'Something went wrong.', error: error.message });
  }
};

// @desc    Suspend or unsuspend a user
// @route   PATCH /api/admin/users/:userId/status
// @access  Admin
export const updateUserStatus = async (req, res) => {
  try {
    const { isSuspended, reason } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.userId,
      { isSuspended },
      { new: true }
    ).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found.' });

    await logAdminAction(req.userId, 'update_user_status', {
      targetUser: user._id,
      reason: isSuspended ? `Suspended: ${reason}` : 'Unsuspended',
    });
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: 'Something went wrong.', error: error.message });
  }
};

// --- CONTENT MODERATION ---

// @desc    Lock or unlock a stack
// @route   PATCH /api/admin/stacks/:stackId/lock
// @access  Admin
export const lockStack = async (req, res) => {
  try {
    const { isLocked } = req.body;
    const stack = await Stack.findByIdAndUpdate(req.params.stackId, { isLocked }, { new: true });
    if (!stack) return res.status(404).json({ message: 'Stack not found.' });

    await logAdminAction(req.userId, 'lock_stack', {
      targetStack: stack._id,
      reason: isLocked ? 'Locked' : 'Unlocked',
    });
    res.status(200).json(stack);
  } catch (error) {
    res.status(500).json({ message: 'Something went wrong.', error: error.message });
  }
};

// @desc    Pin or unpin a stack
// @route   PATCH /api/admin/stacks/:stackId/pin
// @access  Admin
export const pinStack = async (req, res) => {
  try {
    const { isPinned } = req.body;
    const stack = await Stack.findByIdAndUpdate(req.params.stackId, { isPinned }, { new: true });
    if (!stack) return res.status(404).json({ message: 'Stack not found.' });

    await logAdminAction(req.userId, 'pin_stack', {
      targetStack: stack._id,
      reason: isPinned ? 'Pinned' : 'Unpinned',
    });
    res.status(200).json(stack);
  } catch (error) {
    res.status(500).json({ message: 'Something went wrong.', error: error.message });
  }
};

// --- LOGGING ---

// @desc    Get moderation logs
// @route   GET /api/admin/logs
// @access  Admin
export const getModerationLogs = async (req, res) => {
  try {
    const logs = await ModerationLog.find({})
      .populate('admin', 'username')
      .populate('targetUser', 'username')
      .populate('targetStack', 'title')
      .sort({ createdAt: -1 });
    res.status(200).json(logs);
  } catch (error) {
    res.status(500).json({ message: 'Something went wrong.', error: error.message });
  }
};
