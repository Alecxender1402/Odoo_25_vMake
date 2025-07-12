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
      enum: ['new_answer', 'new_comment', 'mention'],
      required: true,
    },
    stack: {
      type: Schema.Types.ObjectId,
      ref: 'Stack',
      required: true,
    },
    comment: {
      type: Schema.Types.ObjectId,
      ref: 'Comment',
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

export const Notification = model('Notification', notificationSchema);
