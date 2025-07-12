import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const moderationLogSchema = new Schema(
  {
    admin: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    action: {
      type: String,
      required: true,
      enum: [
        'delete_stack',
        'delete_comment',
        'lock_stack',
        'unlock_stack',
        'pin_stack',
        'unpin_stack',
        'ban_user',
        'unban_user',
        'change_role'
      ]
    },
    targetUser: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    targetStack: {
      type: Schema.Types.ObjectId,
      ref: 'Stack',
    },
    targetComment: {
      type: Schema.Types.ObjectId,
      ref: 'Comment',
    },
    reason: {
      type: String,
      required: true,
    },
    details: {
      type: Schema.Types.Mixed,
    },
  },
  {
    timestamps: true,
  }
);

// Index for better query performance
moderationLogSchema.index({ admin: 1, createdAt: -1 });
moderationLogSchema.index({ action: 1 });

export const ModerationLog = mongoose.models.ModerationLog || model('ModerationLog', moderationLogSchema);
