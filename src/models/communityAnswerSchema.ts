import mongoose, { Schema, Document } from "mongoose";
import { ICommunityAnswer } from "../interfaces/models/Ianswer";

const CommunityAnswerSchema: Schema<ICommunityAnswer> = new Schema(
  {
    questionId: {
      type: Schema.Types.ObjectId,
      ref: "Question",
      required: [true, "Question ID is required"],
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
      index: true,
    },
    body: {
      type: String,
      required: [true, "Answer body is required"],
      trim: true,
      minlength: [10, "Answer must be at least 10 characters long"],
      maxlength: [10000, "Answer cannot exceed 10000 characters"],
    },
    likes: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    dislikes: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  {
    timestamps: true,
  }
);

CommunityAnswerSchema.index({ questionId: 1, createdAt: -1 });
CommunityAnswerSchema.index({ userId: 1, createdAt: -1 });

const CommunityAnswer = mongoose.model<ICommunityAnswer>(
  "CommunityAnswer",
  CommunityAnswerSchema
);

export default CommunityAnswer;
