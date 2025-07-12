import { Stack } from '../models/Stack.js';
import { StackVote } from '../models/StackVote.js';
import { Comment } from '../models/Comment.js';
import { CommentVote } from '../models/CommentVote.js';
import { checkTagRelevancy } from '../services/ai.service.js';

// @desc    Get all stacks with filtering and sorting
// @route   GET /api/stacks
// @access  Public
export const getAllStacks = async (req, res) => {
  try {
    const { sort, tags, unanswered } = req.query;

    const query = {};
    let sortOptions = {};

    if (unanswered === 'true') {
      query.solution = null;
    }

    if (tags) {
      query.tags = { $in: tags.split(',') };
    }

    switch (sort) {
      case 'popular':
        sortOptions = { voteScore: -1 };
        break;
      case 'newest':
      default:
        sortOptions = { createdAt: -1 };
        break;
    }

    const stacks = await Stack.find(query).populate('creator', 'username').sort(sortOptions);

    res.status(200).json(stacks);
  } catch (error) {
    res.status(500).json({ message: 'Something went wrong.', error: error.message });
  }
};

// @desc    Get a single stack by ID
// @route   GET /api/stacks/:id
// @access  Public
export const getStackById = async (req, res) => {
  try {
    const stack = await Stack.findById(req.params.id)
      .populate('creator', 'username')
      .populate({
        path: 'comments',
        populate: { path: 'author', select: 'username' },
      });

    if (!stack) {
      return res.status(404).json({ message: 'Stack not found.' });
    }
    res.status(200).json(stack);
  } catch (error) {
    res.status(500).json({ message: 'Something went wrong.', error: error.message });
  }
};

// @desc    Create a new stack
// @route   POST /api/stacks
// @access  Private
export const createStack = async (req, res) => {
  try {
    const { title, description, tags } = req.body;

    const isRelevant = await checkTagRelevancy(title, description, tags);
    if (!isRelevant) {
      return res.status(400).json({
        message:
          'The provided tags seem irrelevant to the content. Please review your tags or description.',
      });
    }

    const newStack = new Stack({
      title,
      description,
      tags,
      creator: req.userId,
    });
    await newStack.save();
    res.status(201).json(newStack);
  } catch (error) {
    res.status(500).json({ message: 'Something went wrong.', error: error.message });
  }
};

// @desc    Add a comment to a stack
// @route   POST /api/stacks/:id/comments
// @access  Private
export const addComment = async (req, res) => {
  try {
    const { text } = req.body;
    const stack = await Stack.findById(req.params.id);

    if (!stack) {
      return res.status(404).json({ message: 'Stack not found.' });
    }

    const newComment = new Comment({
      text,
      author: req.userId,
      stack: req.params.id,
    });

    await newComment.save();
    stack.comments.push(newComment._id);
    await stack.save();

    const populatedComment = await Comment.findById(newComment._id).populate('author', 'username');
    res.status(201).json(populatedComment);
  } catch (error) {
    res.status(500).json({ message: 'Something went wrong.', error: error.message });
  }
};

// @desc    Mark a comment as the solution for a stack
// @route   POST /api/stacks/:stackId/comments/:commentId/solution
// @access  Private (Stack Owner only)
export const markAsSolution = async (req, res) => {
  try {
    const { stackId, commentId } = req.params;
    const { userId } = req;

    const stack = await Stack.findById(stackId);
    if (!stack) {
      return res.status(404).json({ message: 'Stack not found.' });
    }

    if (stack.creator.toString() !== userId) {
      return res.status(403).json({ message: 'Only the stack owner can mark a solution.' });
    }

    const comment = await Comment.findById(commentId);
    if (!comment || comment.stack.toString() !== stackId) {
      return res.status(404).json({ message: 'Comment not found on this stack.' });
    }

    if (stack.solution) {
      await Comment.findByIdAndUpdate(stack.solution, { isSolution: false });
    }

    comment.isSolution = true;
    stack.solution = comment._id;

    await comment.save();
    await stack.save();

    res.status(200).json({ message: 'Comment marked as solution.', stack });
  } catch (error) {
    res.status(500).json({ message: 'Something went wrong.', error: error.message });
  }
};

// @desc    Vote on a stack (upvote or downvote)
// @route   POST /api/stacks/:id/vote
// @access  Private
export const voteOnStack = async (req, res) => {
  try {
    const { id: stackId } = req.params;
    const { userId } = req;
    const { type } = req.body;

    if (type !== 'up' && type !== 'down') {
      return res.status(400).json({ message: 'Invalid vote type.' });
    }

    const stack = await Stack.findById(stackId);
    if (!stack) {
      return res.status(404).json({ message: 'Stack not found.' });
    }

    const existingVote = await StackVote.findOne({ user: userId, stack: stackId });

    if (existingVote) {
      if (existingVote.type === type) {
        await StackVote.findByIdAndDelete(existingVote._id);
        if (type === 'up') stack.upvotes -= 1;
        else stack.downvotes -= 1;
      } else {
        if (existingVote.type === 'up') stack.upvotes -= 1;
        else stack.downvotes -= 1;

        if (type === 'up') stack.upvotes += 1;
        else stack.downvotes += 1;

        existingVote.type = type;
        await existingVote.save();
      }
    } else {
      await StackVote.create({ user: userId, stack: stackId, type });
      if (type === 'up') stack.upvotes += 1;
      else stack.downvotes += 1;
    }

    stack.voteScore = stack.upvotes - stack.downvotes;
    await stack.save();

    return res.status(200).json(stack);
  } catch (error) {
    return res.status(500).json({ message: 'Something went wrong.', error: error.message });
  }
};

// @desc    Vote on a comment (upvote or downvote)
// @route   POST /api/stacks/:stackId/comments/:commentId/vote
// @access  Private
export const voteOnComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const { userId } = req;
    const { type } = req.body;

    if (type !== 'up' && type !== 'down') {
      return res.status(400).json({ message: 'Invalid vote type.' });
    }

    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found.' });
    }

    const existingVote = await CommentVote.findOne({ user: userId, comment: commentId });

    if (existingVote) {
      if (existingVote.type === type) {
        await CommentVote.findByIdAndDelete(existingVote._id);
        if (type === 'up') comment.upvotes -= 1;
        else comment.downvotes -= 1;
      } else {
        if (existingVote.type === 'up') comment.upvotes -= 1;
        else comment.downvotes -= 1;

        if (type === 'up') comment.upvotes += 1;
        else comment.downvotes += 1;

        existingVote.type = type;
        await existingVote.save();
      }
    } else {
      await CommentVote.create({ user: userId, comment: commentId, type });
      if (type === 'up') comment.upvotes += 1;
      else comment.downvotes += 1;
    }

    comment.voteScore = comment.upvotes - comment.downvotes;
    await comment.save();

    return res.status(200).json(comment);
  } catch (error) {
    return res.status(500).json({ message: 'Something went wrong.', error: error.message });
  }
};
