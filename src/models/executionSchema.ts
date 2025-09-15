import mongoose, { Schema, Document } from 'mongoose';
import { IRun } from '../interfaces/models/Irun';



export interface RunDocument extends IRun, Document {}

const ExecutionSchema = new Schema<RunDocument>({
  userId: { type: String, required: true },
  problemId: { type: String, required: true },
  language: { type: String, required: true },
  code: { type: String, required: true },
  testResult: {
    status: { type: String, enum: ['success', 'error'], required: true },
    output: { type: String },
  },
  createdAt: { type: Date, default: Date.now }
});

// Create and export the model
export const ExecutionModel = mongoose.model<RunDocument>('Run', ExecutionSchema);
