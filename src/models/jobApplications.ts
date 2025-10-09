import mongoose, { Schema } from "mongoose";
import { IJobApplication } from "../interfaces/models/Ijob";


const jobApplicationSchema: Schema<IJobApplication> = new mongoose.Schema(
  {
    jobId: {
      type: Schema.Types.ObjectId,
      ref: "JobPost",
      required: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    recruiterId: {
        type: Schema.Types.ObjectId,
        ref: "Recruiter",
        required: true,
      },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    contactNo: {
      type: String,
      required: true,
      trim: true,
    },
    location: {
      type: String,
      required: true,
      trim: true,
    },

    education: {
      highestQualification: {
        type: String,
        required: true,
        trim: true,
      },
      qualificationName: {
        type: String,
        required: true,
        trim: true,
      },
      institutionName: {
        type: String,
        required: true,
        trim: true,
      },
      yearOfGraduation: {
        type: String,
        required: true,
        trim: true,
      },
      cgpa: {
        type: String,
        required: true,
        trim: true,
      },
    },
    workExperience: {
      totalExperience: {
        type: String,
        trim: true,
      },
      previousJobTitles: {
        type: String,
        trim: true,
      },
      companyNames: {
        type: String,
        trim: true,
      },
    },
    skills: {
      type: [String],
      required: true,
    },
    links: {
      githubProfile: {
        type: String,
        trim: true,
      },
      linkedinProfile: {
        type: String,
        trim: true,
      },
      personalWebsite: {
        type: String,
        trim: true,
      },
    },  
    documents: {
      resume: {
        type: String,
        required: true,
      },
      plusTwoCertificate: {
        type: String,
      },
      degreeCertificate: {
        type: String,
      },
      pgCertificate: {
        type: String,
      },
    },
    aboutYourself: {
      type: String,
      required: true,
      minlength: [50, "About yourself must be at least 50 characters"],
    },
    status: {
      type: String,
      enum: ["pending", "scheduled", "shortlisted", "rejected", "accepted"],
      default: "pending",
    },
    aiScore: {
      type: Number,
      min: 0,
      max: 100,
    },
    aiProcessedAt: {
      type: Date,
    },
    appliedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

jobApplicationSchema.index({ jobId: 1, userId: 1 });
jobApplicationSchema.index({ email: 1 });
jobApplicationSchema.index({ status: 1 });
jobApplicationSchema.index({ appliedAt: -1 });
jobApplicationSchema.index({ jobId: 1, userId: 1 }, { unique: true });

const jobApplication = mongoose.model<IJobApplication>(
  "JobApplication",
  jobApplicationSchema
);

export default jobApplication;
