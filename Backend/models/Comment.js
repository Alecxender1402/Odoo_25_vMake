import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const commentSchema = new Schema(
  {
    text: {
      type: String,
      required: [true, 'Comment text cannot be empty.'],
      trim: true,
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

export const Comment = mongoose.models.Comment || model('Comment', commentSchema);
