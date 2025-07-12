import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const commentVoteSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    comment: {
      type: Schema.Types.ObjectId,
      ref: 'Comment',
      required: true,
    },
    type: {
      type: String,
      enum: ['up', 'down'],
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

commentVoteSchema.index({ user: 1, comment: 1 }, { unique: true });

export const CommentVote = mongoose.models.CommentVote || model('CommentVote', commentVoteSchema);
