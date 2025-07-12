import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const stackVoteSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    stack: {
      type: Schema.Types.ObjectId,
      ref: 'Stack',
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

stackVoteSchema.index({ user: 1, stack: 1 }, { unique: true });

export const StackVote = mongoose.models.StackVote || model('StackVote', stackVoteSchema);
