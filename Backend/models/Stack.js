import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const Tags = [
  'JavaScript',
  'React',
  'Node.js',
  'Vue',
  'Angular',
  'Python',
  'Django',
  'Flask',
  'Java',
  'Spring',
  'MongoDB',
  'PostgreSQL',
  'Docker',
  'AWS',
  'Firebase',
  'GraphQL',
  'TypeScript',
  'Other',
];

const stackSchema = new Schema(
  {
    title: {
      type: String,
      required: [true, 'Stack title is required.'],
      trim: true,
      maxlength: [100, 'Title cannot be more than 100 characters long.'],
    },
    description: {
      type: String,
      required: [true, 'Stack description is required.'],
      trim: true,
    },
    tags: {
      type: [String],
      required: [true, 'Please provide at least one tag.'],
      enum: {
        values: Tags,
        message: '"{VALUE}" is not a supported tag.',
      },
      validate: {
        validator: (tags) => tags.length > 0,
        message: 'A stack must have at least one tag.',
      },
    },
    creator: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    solution: {
      type: Schema.Types.ObjectId,
      ref: 'Comment',
      default: null,
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
    comments: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Comment',
      },
    ],
  },
  {
    timestamps: true,
  }
);

export const Stack = mongoose.models.Stack || model('Stack', stackSchema);
