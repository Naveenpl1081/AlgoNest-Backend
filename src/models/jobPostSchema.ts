import mongoose, { Schema } from "mongoose";
import { IJobPost } from "../interfaces/models/Ijob";

const jobPostSchema: Schema<IJobPost> = new mongoose.Schema(
  {
    jobrole: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    jobLocation: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    workTime: {
      type: String,
      required: true,
      enum: ["full-time", "part-time", "contract", "internship"],
    },
    workMode: {
      type: String,
      required: true,
      enum: ["remote", "on-site", "hybrid"],
    },
    minExperience: {
      type: Number,
      required: true,
      min: 0,
      max: 50,
    },
    minSalary: {
      type: Number,
      required: true,
      min: 0,
    },
    maxSalary: {
      type: Number,
      required: true,
      min: 0,
    },
    requirements: [
      {
        type: String,
        trim: true,
        maxlength: 500,
      },
    ],
    responsibilities: [
      {
        type: String,
        trim: true,
        maxlength: 500,
      },
    ],
    recruiterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Recruiter",
      required: true,
    },
    status: {
      type: String,
      enum: ["Active", "InActive"],
      default: "Active",
    },
    applicationsCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

jobPostSchema.index({ recruiterId: 1 });
jobPostSchema.index({ role: 1 });
jobPostSchema.index({ jobLocation: 1 });
jobPostSchema.index({ workTime: 1 });
jobPostSchema.index({ workMode: 1 });
jobPostSchema.index({ isActive: 1 });
jobPostSchema.index({ createdAt: -1 });

const JobPost = mongoose.model<IJobPost>("JobPost", jobPostSchema);

export default JobPost;
