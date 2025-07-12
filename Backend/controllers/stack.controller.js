import { Stack, Tags } from '../models/Stack.js';
import { StackVote } from '../models/StackVote.js';
import { Comment } from '../models/Comment.js';
import { CommentVote } from '../models/CommentVote.js';
import { User } from '../models/User.js';
import { Notification } from '../models/Notification.js';
import mongoose from 'mongoose';

// @desc    Create a new stack
// @route   POST /api/stacks
// @access  Private
export const createStack = async (req, res) => {
  try {
    console.log('=== CREATE STACK DEBUG INFO ===');
    console.log('Request body:', JSON.stringify(req.body, null, 2));
    console.log('Request headers:', {
      'content-type': req.get('content-type'),
      'authorization': req.get('authorization') ? 'Present' : 'Missing'
    });
    console.log('User ID from token:', req.userId);
    console.log('User object:', req.user ? req.user.username : 'Not available');
    
    // Check authentication first
    if (!req.userId) {
      console.log('❌ Authentication failed: No user ID');
      return res.status(401).json({ 
        message: 'Authentication required. Please login to post questions.',
        code: 'AUTH_REQUIRED'
      });
    }
    
    const { title, description, tags } = req.body;
    
    // Enhanced validation with detailed logging
    if (!title) {
      console.log('❌ Validation failed: Missing title');
      return res.status(400).json({ 
        message: 'Title is required',
        field: 'title',
        received: title
      });
    }

    if (!description) {
      console.log('❌ Validation failed: Missing description');
      return res.status(400).json({ 
        message: 'Description is required',
        field: 'description',
        received: description
      });
    }

    if (!tags) {
      console.log('❌ Validation failed: Missing tags');
      return res.status(400).json({ 
        message: 'Tags are required',
        field: 'tags',
        received: tags
      });
    }

    if (typeof title !== 'string' || title.trim().length === 0) {
      console.log('❌ Validation failed: Invalid title type or empty');
      return res.status(400).json({ 
        message: 'Title must be a non-empty string',
        field: 'title',
        type: typeof title,
        length: title?.length
      });
    }

    if (typeof description !== 'string' || description.trim().length === 0) {
      console.log('❌ Validation failed: Invalid description type or empty');
      return res.status(400).json({ 
        message: 'Description must be a non-empty string',
        field: 'description',
        type: typeof description,
        length: description?.length
      });
    }

    if (!Array.isArray(tags) || tags.length === 0) {
      console.log('❌ Validation failed: Invalid tags format');
      return res.status(400).json({ 
        message: 'Tags must be a non-empty array',
        field: 'tags',
        type: typeof tags,
        isArray: Array.isArray(tags),
        length: tags?.length
      });
    }

    // Clean and validate tags
    console.log('Original tags:', tags);
    const cleanedTags = tags.map(tag => {
      if (typeof tag !== 'string') {
        return String(tag).trim();
      }
      return tag.trim();
    }).filter(tag => {
      const isValid = tag.length > 0 && 
                     tag.length <= 50 && 
                     /^[a-zA-Z0-9\s\-\+\#\.\_]+$/.test(tag);
      if (!isValid) {
        console.log(`❌ Invalid tag: "${tag}"`);
      }
      return isValid;
    });

    console.log('Cleaned tags:', cleanedTags);

    if (cleanedTags.length === 0) {
      console.log('❌ Validation failed: No valid tags after cleaning');
      return res.status(400).json({ 
        message: 'At least one valid tag is required. Tags must be 1-50 characters and contain only letters, numbers, spaces, hyphens, plus signs, hashtags, dots, and underscores.',
        originalTags: tags,
        cleanedTags: cleanedTags
      });
    }

    if (cleanedTags.length > 10) {
      console.log('❌ Validation failed: Too many tags');
      return res.status(400).json({ 
        message: 'Maximum 10 tags allowed',
        count: cleanedTags.length
      });
    }

    console.log('✅ All validations passed, creating stack...');

    const newStack = new Stack({
      title: title.trim(),
      description: description.trim(),
      tags: cleanedTags,
      creator: req.userId,
    });

    console.log('Stack object to save:', {
      title: newStack.title,
      description: newStack.description.substring(0, 100) + '...',
      tags: newStack.tags,
      creator: newStack.creator
    });
    
    const savedStack = await newStack.save();
    console.log('✅ Stack saved with ID:', savedStack._id);
    
    const populatedStack = await Stack.findById(savedStack._id)
      .populate('creator', 'username')
      .populate({
        path: 'comments',
        select: '_id'
      });
    
    console.log('✅ Stack created and populated successfully');
    res.status(201).json(populatedStack);
    
  } catch (error) {
    console.error('❌ Error creating stack:');
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    
    // Check for specific MongoDB validation errors
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        message: 'Validation failed',
        errors: validationErrors,
        details: error.errors
      });
    }
    
    res.status(500).json({ 
      message: 'Something went wrong while creating the question.', 
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

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

    // Sort options: Pinned stacks always come first, then by the selected sort order.
    sortOptions = { isPinned: -1, ...sortOptions };

    const stacks = await Stack.find(query)
      .populate('creator', 'username')
      .populate({
        path: 'comments',
        select: '_id'
      })
      .sort(sortOptions);

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
    const { id } = req.params;
    
    console.log('Fetching stack with ID:', id);
    
    // Try to find the stack without strict ObjectId validation
    const stack = await Stack.findOneAndUpdate(
      { _id: id },
      { $inc: { views: 1 } }, // Increment views
      { new: true }
    )
      .populate('creator', 'username')
      .populate({
        path: 'comments',
        populate: { path: 'author', select: 'username' },
      });

    if (!stack) {
      console.log('Stack not found with ID:', id);
      return res.status(404).json({ 
        message: 'Question not found.',
        id: id
      });
    }
    
    console.log('Stack found successfully:', stack._id);
    res.status(200).json(stack);
  } catch (error) {
    console.error('Error fetching stack by ID:', error);
    res.status(500).json({ 
      message: 'Something went wrong while fetching the question.', 
      error: error.message 
    });
  }
};

// @desc    Update a stack
// @route   PUT /api/stacks/:id
// @access  Private (Stack Owner only)
export const updateStack = async (req, res) => {
  try {
    const { title, description, tags } = req.body;
    const stack = await Stack.findById(req.params.id);

    if (!stack) {
      return res.status(404).json({ message: 'Stack not found.' });
    }

    if (stack.creator.toString() !== req.userId) {
      return res.status(403).json({ message: 'You can only update your own stacks.' });
    }

    if (title) stack.title = title;
    if (description) stack.description = description;
    if (tags) {
      // Apply same tag cleaning logic for updates
      const cleanTags = tags.map(tag => {
        if (typeof tag !== 'string') {
          return String(tag).trim();
        }
        return tag.trim();
      }).filter(tag => {
        return tag.length > 0 && 
               tag.length <= 50 && 
               /^[a-zA-Z0-9\s\-\+\#\.\_]+$/.test(tag);
      });
      
      if (cleanTags.length === 0) {
        return res.status(400).json({ 
          message: 'At least one valid tag is required.' 
        });
      }
      
      stack.tags = cleanTags;
    }

    await stack.save();
    res.status(200).json({ message: 'Stack updated successfully.', stack });
  } catch (error) {
    res.status(500).json({ message: 'Something went wrong.', error: error.message });
  }
};

// @desc    Delete a stack
// @route   DELETE /api/stacks/:id
// @access  Private (Stack Owner or Admin only)
export const deleteStack = async (req, res) => {
  try {
    const stack = await Stack.findById(req.params.id);

    if (!stack) {
      return res.status(404).json({ message: 'Stack not found.' });
    }

    // Check if user is admin or stack owner
    const user = await User.findById(req.userId);
    if (stack.creator.toString() !== req.userId && user.role !== 'admin') {
      return res.status(403).json({ message: 'You can only delete your own stacks or you must be an admin.' });
    }

    // Delete all related data
    await Comment.deleteMany({ _id: { $in: stack.comments } });
    await StackVote.deleteMany({ stack: req.params.id });
    await CommentVote.deleteMany({ comment: { $in: stack.comments } });
    await Notification.deleteMany({ stack: req.params.id });
    
    await Stack.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Stack deleted successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'Something went wrong.', error: error.message });
  }
};

// @desc    Get comments for a stack
// @route   GET /api/stacks/:id/comments
// @access  Public  
export const getComments = async (req, res) => {
  try {
    const { id } = req.params;
    
    console.log('Fetching comments for stack ID:', id);
    
    // Try to find the stack without strict ObjectId validation
    const stack = await Stack.findOne({ _id: id })
      .populate({
        path: 'comments',
        populate: { path: 'author', select: 'username' },
        options: { sort: { createdAt: -1 } }
      });

    if (!stack) {
      console.log('Stack not found for comments with ID:', id);
      return res.status(404).json({ 
        message: 'Question not found.',
        id: id
      });
    }

    console.log('Comments found for stack:', stack._id, 'Count:', stack.comments.length);
    res.status(200).json(stack.comments);
  } catch (error) {
    console.error('Error fetching comments:', error);
    res.status(500).json({ 
      message: 'Something went wrong while fetching comments.', 
      error: error.message 
    });
  }
};

// @desc    Add a comment to a stack
// @route   POST /api/stacks/:id/comments
// @access  Private
export const createComment = async (req, res) => {
  try {
    const { text } = req.body;
    const stack = await Stack.findById(req.params.id).populate('creator', 'username');

    if (!stack) {
      return res.status(404).json({ message: 'Stack not found.' });
    }

    if (!text || text.trim().length === 0) {
      return res.status(400).json({ message: 'Comment text is required.' });
    }

    const newComment = new Comment({
      text: text.trim(),
      author: req.userId,
      stack: req.params.id,
    });

    await newComment.save();
    stack.comments.push(newComment._id);
    await stack.save();

    const populatedComment = await Comment.findById(newComment._id)
      .populate('author', 'username');

    // Notify the question author about the new answer (if not self-answering)
    if (stack.creator._id.toString() !== req.userId) {
      await Notification.create({
        recipient: stack.creator._id,
        sender: req.userId,
        type: 'new_comment',
        stack: req.params.id,
        comment: newComment._id,
        message: `${populatedComment.author.username} answered your question: "${stack.title}"`
      });
    }

    // Check for mentioned users in the comment
    const mentionRegex = /@(\w+)/g;
    const mentions = text.match(mentionRegex);
    
    if (mentions) {
      const mentionedUsernames = mentions.map(mention => mention.substring(1)); // Remove @ symbol
      const mentionedUsers = await User.find({ 
        username: { $in: mentionedUsernames },
        _id: { $ne: req.userId } // Don't notify the commenter
      });

      for (const user of mentionedUsers) {
        await Notification.create({
          recipient: user._id,
          sender: req.userId,
          type: 'user_mentioned',
          stack: req.params.id,
          comment: newComment._id,
          message: `${populatedComment.author.username} mentioned you in an answer to: "${stack.title}"`
        });
      }
    }
    
    res.status(201).json(populatedComment);
  } catch (error) {
    res.status(500).json({ message: 'Something went wrong.', error: error.message });
  }
};

// @desc    Get available tags (now returns both predefined and recently used tags)
// @route   GET /api/stacks/tags
// @access  Public
export const getAvailableTags = async (req, res) => {
  try {
    // Get recently used tags from database
    const recentTags = await Stack.aggregate([
      { $unwind: '$tags' },
      { $group: { _id: '$tags', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 50 },
      { $project: { _id: 0, tag: '$_id', count: 1 } }
    ]);

    // Combine predefined tags with recent tags
    const allTags = [
      ...Tags.map(tag => ({ tag, count: 0, predefined: true })),
      ...recentTags.filter(rt => !Tags.includes(rt.tag)).map(rt => ({ ...rt, predefined: false }))
    ];

    res.status(200).json({
      predefined: Tags,
      all: allTags,
      recent: recentTags.map(rt => rt.tag)
    });
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

    // Check if stack is locked
    if (stack.isLocked) {
      return res.status(403).json({ message: 'This stack is locked and cannot be voted on.' });
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

    const populatedStack = await Stack.findById(stackId)
      .populate('creator', 'username')
      .populate({
        path: 'comments',
        select: '_id'
      });

    return res.status(200).json(populatedStack);
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
