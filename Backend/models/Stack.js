import mongoose from 'mongoose';
const { Schema, model } = mongoose;

const stackSchema = new Schema({
    title: {
        type: String,
        required: [true, 'Stack title is required.'],
        trim: true
    },
    description: {
        type: String,
        required: [true, 'Stack description is required.'],
        trim: true
    },
    technologies: [{
        type: String,
        trim: true
    }],
    creator: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    upvoteCount: {
        type: Number,
        default: 0 
    },
    comments: [{
        type: Schema.Types.ObjectId,
        ref: 'Comment'
    }]
}, {
    timestamps: true
});

export const Stack = mongoose.models.Stack || model('Stack', stackSchema);