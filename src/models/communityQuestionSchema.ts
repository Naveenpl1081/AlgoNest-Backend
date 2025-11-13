

import mongoose, { Schema, Document, Types } from 'mongoose';
import { IQuestion } from '../interfaces/models/Iquestion';

const QuestionSchema = new Schema<IQuestion>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true
    },
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      minlength: [10, 'Title must be at least 10 characters'],
      maxlength: [300, 'Title cannot exceed 300 characters']
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
      minlength: [20, 'Description must be at least 20 characters'],
      maxlength: [10000, 'Description cannot exceed 10000 characters']
    },
    tags: {
      type: [String],
      required: [true, 'At least one tag is required'],
      validate: {
        validator: function(tags: string[]) {
          return tags.length > 0 && tags.length <= 5;
        },
        message: 'Question must have between 1 and 5 tags'
      },
      index: true
    },
    upvotes: {
      type: Number,
      default: 0,
      min: 0
    },
    downvotes: {
      type: Number,
      default: 0,
      min: 0
    },
    answersCount: {
      type: Number,
      default: 0,
      min: 0
    }
  },
  {
    timestamps: true,
  }
);


QuestionSchema.index({ createdAt: -1 });
QuestionSchema.index({ upvotes: -1 });
QuestionSchema.index({ tags: 1, createdAt: -1 });
QuestionSchema.index({ userId: 1, createdAt: -1 });
QuestionSchema.index({ title: 'text', description: 'text' }); 


const Question= mongoose.model<IQuestion>('Question', QuestionSchema)
export default Question