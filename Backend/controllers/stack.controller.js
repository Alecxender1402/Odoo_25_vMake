import { Stack } from '../models/Stack.js';
import { Vote } from '../models/Vote.js';
import { Comment } from '../models/Comment.js';

// @desc    Get all stacks
// @route   GET /api/stacks
// @access  Public
export const getAllStacks = async (req, res) => {
    try {
        const stacks = await Stack.find().populate('creator', 'username').sort({ createdAt: -1 });
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
                populate: { path: 'author', select: 'username' }
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
        const { title, description, technologies } = req.body;
        const newStack = new Stack({
            title,
            description,
            technologies,
            creator: req.userId, // This comes from the verifyToken middleware
        });
        await newStack.save();
        res.status(201).json(newStack);
    } catch (error) {
        res.status(500).json({ message: 'Something went wrong.', error: error.message });
    }
};

// @desc    Upvote or remove upvote from a stack
// @route   POST /api/stacks/:id/vote
// @access  Private
export const upvoteStack = async (req, res) => {
    try {
        const stackId = req.params.id;
        const userId = req.userId; // This comes from the verifyToken middleware

        const stack = await Stack.findById(stackId);
        if (!stack) {
            return res.status(404).json({ message: 'Stack not found.' });
        }

        const existingVote = await Vote.findOne({ user: userId, stack: stackId });

        if (existingVote) {
            // If vote exists, remove it (un-vote)
            await Vote.findByIdAndDelete(existingVote._id);
            stack.upvoteCount -= 1;
            await stack.save();
            return res.status(200).json({ message: 'Vote removed.', stack });
        } else {
            // If vote does not exist, add it (up-vote)
            const newVote = new Vote({ user: userId, stack: stackId });
            await newVote.save();
            stack.upvoteCount += 1;
            await stack.save();
            return res.status(200).json({ message: 'Stack upvoted successfully.', stack });
        }
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