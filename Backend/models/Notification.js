import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const notificationSchema = new Schema(
  {
    recipient: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    sender: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    type: {
      type: String,
      enum: [
        'stack_vote',
        'comment_vote', 
        'new_comment',
        'comment_accepted',
        'stack_mentioned',
        'user_mentioned'
      ],
      required: true,
    },
    stack: {
      type: Schema.Types.ObjectId,
      ref: 'Stack',
    },
    comment: {
      type: Schema.Types.ObjectId,
      ref: 'Comment',
    },
    message: {
      type: String,
      required: true,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Index for better query performance
notificationSchema.index({ recipient: 1, createdAt: -1 });
notificationSchema.index({ isRead: 1 });

export const Notification = mongoose.models.Notification || model('Notification', notificationSchema);
