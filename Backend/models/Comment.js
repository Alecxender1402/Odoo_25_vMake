import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const commentSchema = new Schema(
  {
    text: {
      type: String,
      required: [true, 'Comment text is required.'],
      trim: true,
      minlength: [1, 'Comment must be at least 1 character long.'],
      maxlength: [5000, 'Comment cannot be more than 5000 characters long.'],
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    stack: {
      type: Schema.Types.ObjectId,
      ref: 'Stack',
      required: true,
    },
    isSolution: {
      type: Boolean,
      default: false,
    },
    voteScore: {
      type: Number,
      default: 0,
    },
    upvotes: {
      type: Number,
      default: 0,
    },
    downvotes: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Index for better query performance
commentSchema.index({ stack: 1, createdAt: -1 });
commentSchema.index({ author: 1 });

export const Comment = mongoose.models.Comment || model('Comment', commentSchema);
