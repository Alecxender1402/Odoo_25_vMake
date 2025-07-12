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
        'update_user_role',
        'update_user_status',
        'lock_stack',
        'pin_stack',
      ],
    },
    targetUser: { type: Schema.Types.ObjectId, ref: 'User' },
    targetStack: { type: Schema.Types.ObjectId, ref: 'Stack' },
    reason: { type: String },
  },
  {
    timestamps: true,
  }
);

export const ModerationLog = model('ModerationLog', moderationLogSchema);
