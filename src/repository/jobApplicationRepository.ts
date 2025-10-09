import {
  IJobApplication,
  IJobApplicationInput,
} from "../interfaces/models/Ijob";
import { BaseRepository } from "./baseRepository";
import jobApplication from "../models/jobApplications";
import { IJobApplicationRepository } from "../interfaces/Irepositories/IjobApplicationRepository";
import mongoose, { FilterQuery, UpdateQuery } from "mongoose";

export class JobApplicationRepository
  extends BaseRepository<IJobApplication>
  implements IJobApplicationRepository
{
  constructor() {
    super(jobApplication);
  }

  async applyJob(
    userId: string,
    recruiterId: string,
    jobId: string,
    applicationDetails: IJobApplicationInput
  ): Promise<IJobApplication> {
    try {
      if (!mongoose.Types.ObjectId.isValid(userId)) {
        throw new Error("Invalid user ID");
      }
      if (!mongoose.Types.ObjectId.isValid(recruiterId)) {
        throw new Error("Invalid recruiter ID");
      }
      if (!mongoose.Types.ObjectId.isValid(jobId)) {
        throw new Error("Invalid job ID");
      }

      const existingApplication = await this.model.findOne({
        userId: new mongoose.Types.ObjectId(userId),
        jobId: new mongoose.Types.ObjectId(jobId),
      });

      if (existingApplication) {
        throw new Error("You have already applied for this job");
      }

      const payload = {
        ...applicationDetails,
        userId: new mongoose.Types.ObjectId(userId),
        recruiterId: new mongoose.Types.ObjectId(recruiterId),
        jobId: new mongoose.Types.ObjectId(jobId),
        status: "pending" as const,
        appliedAt: new Date(),
      };

      const result = await this.create(payload);
      return result;
    } catch (error) {
      const err = error as Error;
      console.error(
        "Error occurred while creating the job application:",
        err.message
      );
      throw new Error(
        err.message || "An error occurred while creating the job application"
      );
    }
  }

  async getOneApplication(
    userId: string,
    jobId: string
  ): Promise<IJobApplication | null> {
    try {
      const application = await this.findOne({
        userId: new mongoose.Types.ObjectId(userId),
        jobId: new mongoose.Types.ObjectId(jobId),
      });
      return application;
    } catch (error) {
      console.error(error);
      return null;
    }
  }

  async getAllApplicants(options: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    recruiterId?: string;
  }): Promise<{
    data: IJobApplication[];
    total: number;
    page: number;
    limit: number;
    pages: number;
  }> {
    try {
      console.log("entering the function which fetches all the applicants");
      const page = options.page || 1;
      const limit = options.limit || 10;

      const filter: FilterQuery<IJobApplication> = {};

      if (options.recruiterId) {
        filter.recruiterId = options.recruiterId;
      }

      if (options.search) {
        filter.$or = [
          { name: { $regex: options.search, $options: "i" } },
          { email: { $regex: options.search, $options: "i" } },
          { contactNo: { $regex: options.search, $options: "i" } },
        ];
      }

      if (options.status) {
        filter.status = options.status;
      }

      console.log("filter", filter);

      const result = (await this.find(filter, {
        pagination: { page, limit },
        sort: { appliedAt: -1 },
        populate: [
          { path: "jobId", select: "jobrole" },
          { path: "userId", select: "username email" },
        ],
      })) as { data: IJobApplication[]; total: number };

      console.log("data fetched from the applicant repository:", result);

      return {
        data: result.data,
        total: result.total,
        page,
        limit,
        pages: Math.ceil(result.total / limit),
      };
    } catch (error) {
      console.error("error occurred while fetching the applicants:", error);
      throw new Error("Failed to fetch the applicants");
    }
  }

  async getAllShortlistApplicants(options: {
    page?: number;
    limit?: number;
    search?: string;
    recruiterId?: string;
  }): Promise<{
    data: IJobApplication[];
    total: number;
    page: number;
    limit: number;
    pages: number;
  }> {
    try {
      console.log("entering the function which fetches all the applicants");
      const page = options.page || 1;
      const limit = options.limit || 10;

      const filter: FilterQuery<IJobApplication> = {};

      if (options.recruiterId) {
        filter.recruiterId = options.recruiterId;
      }

      if (options.search) {
        filter.$or = [
          { name: { $regex: options.search, $options: "i" } },
          { email: { $regex: options.search, $options: "i" } },
          { contactNo: { $regex: options.search, $options: "i" } },
        ];
      }

      filter.status = { $in: ["shortlisted", "scheduled"] };

      console.log("filter", filter);

      const result = (await this.find(filter, {
        pagination: { page, limit },
        sort: { appliedAt: -1 },
        populate: [
          { path: "jobId", select: "jobrole" },
          { path: "userId", select: "username email" },
        ],
      })) as { data: IJobApplication[]; total: number };

      console.log("data fetched from the applicant repository:", result);

      return {
        data: result.data,
        total: result.total,
        page,
        limit,
        pages: Math.ceil(result.total / limit),
      };
    } catch (error) {
      console.error("error occurred while fetching the applicants:", error);
      throw new Error("Failed to fetch the applicants");
    }
  }

  async getFilteredApplications(
    jobId: string,
    recruiterId: string
  ): Promise<IJobApplication[]> {
    try {
      const filter: FilterQuery<IJobApplication> = {
        jobId,
        recruiterId,
        status: { $in: ["pending"] },
      };

      const applications = await this.find(filter);

      return Array.isArray(applications) ? applications : applications.data;
    } catch (error: any) {
      console.error("Get Filtered Applications Error:", error);
      throw new Error(`Failed to fetch applications: ${error.message}`);
    }
  }

  async updateAIShortlist(
    applicationId: string,
    status: "shortlisted" | "rejected",
    score?: number
  ): Promise<IJobApplication | null> {
    try {
      const update: UpdateQuery<IJobApplication> = {
        status,
        ...(score !== undefined && { aiScore: score }),
        aiProcessedAt: new Date(),
      };

      const updatedApplication = await this.model.findByIdAndUpdate(
        applicationId,
        { $set: update },
        { new: true }
      );

      if (!updatedApplication) {
        console.warn(`Application not found: ${applicationId}`);
        return null;
      }

      console.log(
        `Updated application ${applicationId}: status=${status}, score=${score}`
      );
      return updatedApplication;
    } catch (error: any) {
      console.error("Update AI Shortlist Error:", error);
      throw new Error(`Failed to update application: ${error.message}`);
    }
  }

  async findApplication(
    applicationId: string
  ): Promise<IJobApplication | null> {
    try {
      const application = await this.findById(applicationId);
      return application;
    } catch (error) {
      console.error(error);
      return null;
    }
  }

  async updateApplicationStatus(
    applicationId: string,
    status: string
  ): Promise<IJobApplication | null> {
    try {
      const updated = await this.updateOne(
        { _id: applicationId } as FilterQuery<IJobApplication>,
        { status } as UpdateQuery<IJobApplication>
      );
      return updated;
    } catch (error) {
      console.error("Error updating application status:", error);
      return null;
    }
  }
}
