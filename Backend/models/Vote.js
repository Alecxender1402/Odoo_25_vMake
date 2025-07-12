import mongoose from 'mongoose';
const { Schema, model } = mongoose;

const voteSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    stack: {
        type: Schema.Types.ObjectId,
        ref: 'Stack',
        required: true
    }
}, {
    timestamps: true
});
voteSchema.index({ user: 1, stack: 1 }, { unique: true });

export const Vote = mongoose.models.Vote || model('Vote', voteSchema);