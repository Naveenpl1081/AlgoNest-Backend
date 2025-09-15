import mongoose, { Schema } from "mongoose";
import { IProblem } from "../interfaces/models/Iproblem";

const problemSchema: Schema<IProblem> = new Schema(
  {
    problemId: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    difficulty: { type: String, required: true },
    tags: { type: [String], default: [] },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Category",
    },
    constraints: { type: [String], default: [] },
    testCases: [
      {
        input: { type: String, required: true },
        output: { type: String, required: true },
      },
    ],
    examples: [
      {
        input: { type: String, required: true },
        output: { type: String, required: true },
        explanation: { type: String },
      },
    ],
    functionName: { type: String, required: true },
    status: {
      type: String,
      enum: ["Active", "InActive"],
      default: "Active",
    },
    timeLimit:{
      type:String,
      required: true 
    },
    memoryLimit:{
      type:String,
      required: true 
    },
    parameters: [
      {
        name: { type: String, required: true },
        type: { type: String, required: true },
      },
    ],
    returnType: { type: String, required: true },
    isPremium: { type: Boolean, default: false },
    visible: { type: Boolean, default: true },
    solution: { type: String, default: "" },
    starterCode: { type: Map, of: String, default: {} },
    hints: { type: [String], default: [] },
  },
  {
    timestamps: true,
  }
);

const Problem = mongoose.model<IProblem>("Problem", problemSchema);
export default Problem;
