import mongoose, { Schema, Document } from "mongoose";
export interface RunDocument extends Document {
  userId: string;
  problemId: string;
  language: string;
  code: string;
  testResults: Array<{
    caseNumber: number;
    input: string;
    output: string;
    expected: string;
    passed: boolean;
    error?: string;
    executionTime?: number;
    memoryUsed?: number;
  }>;
  overallStatus: 'passed' | 'failed' | 'error';
  createdAt: Date;
}

const ExecutionSchema = new Schema<RunDocument>({
  userId: { type: String, required: true },
  problemId: { type: String, required: true },
  language: { type: String, required: true },
  code: { type: String, required: true },
  testResults: [
    {
      caseNumber: { type: Number, required: true },
      input: { type: String, required: true },
      output: { type: String, required: false,default:"" },
      expected: { type: String, required: true },
      passed: { type: Boolean, required: true },
      error: { type: String },
      executionTime: { type: Number },
      memoryUsed: { type: Number },
    },
  ],
  overallStatus: {
    type: String,
    enum: ["passed", "failed", "error"],
    required: true,
  },
  createdAt: { type: Date, default: Date.now },
});

export const ExecutionModel = mongoose.model<RunDocument>(
  "Run",
  ExecutionSchema
);
