import mongoose from 'mongoose';

const { Schema, model } = mongoose;

// Predefined tags (suggestions)
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
  'HTML',
  'CSS',
  'Bootstrap',
  'Tailwind',
  'Express',
  'FastAPI',
  'MySQL',
  'Redis',
  'Kubernetes',
  'DevOps',
  'Security',
  'Testing',
  'Performance',
  'Other',
];

const stackSchema = new Schema(
  {
    title: {
      type: String,
      required: [true, 'Stack title is required.'],
      trim: true,
      maxlength: [200, 'Title cannot be more than 200 characters long.'],
    },
    description: {
      type: String,
      required: [true, 'Stack description is required.'],
      trim: true,
    },
    tags: {
      type: [String],
      required: [true, 'Please provide at least one tag.'],
      validate: {
        validator: function(tags) {
          // Basic validation: at least one tag, maximum 10 tags
          if (!tags || tags.length === 0) return false;
          if (tags.length > 10) return false;
          
          // Validate each tag
          return tags.every(tag => {
            if (typeof tag !== 'string') return false;
            const trimmedTag = tag.trim();
            // Check length and format
            return trimmedTag.length > 0 && 
                   trimmedTag.length <= 50 && 
                   /^[a-zA-Z0-9\s\-\+\#\.\_]+$/.test(trimmedTag);
          });
        },
        message: 'Tags must be 1-50 characters, contain only letters, numbers, spaces, hyphens, plus signs, hashtags, dots, and underscores. Maximum 10 tags allowed.'
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
    views: {
      type: Number,
      default: 0,
    },
    comments: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Comment',
      },
    ],
    isLocked: {
      type: Boolean,
      default: false,
    },
    isPinned: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Pre-save middleware to clean and normalize tags
stackSchema.pre('save', function(next) {
  if (this.tags && this.tags.length > 0) {
    this.tags = this.tags.map(tag => {
      const trimmedTag = String(tag).trim();
      // Capitalize first letter for consistency
      return trimmedTag.charAt(0).toUpperCase() + trimmedTag.slice(1);
    });
    
    // Remove duplicates (case insensitive)
    const uniqueTags = [];
    const seenTags = new Set();
    
    this.tags.forEach(tag => {
      const lowerTag = tag.toLowerCase();
      if (!seenTags.has(lowerTag)) {
        seenTags.add(lowerTag);
        uniqueTags.push(tag);
      }
    });
    
    this.tags = uniqueTags;
  }
  next();
});

// Indexes for better performance
stackSchema.index({ creator: 1 });
stackSchema.index({ tags: 1 });
stackSchema.index({ voteScore: -1 });
stackSchema.index({ createdAt: -1 });
stackSchema.index({ isPinned: -1, voteScore: -1 });

export const Stack = mongoose.models.Stack || model('Stack', stackSchema);
export { Tags };
