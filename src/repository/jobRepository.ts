import { IJobRequestDTO } from "../interfaces/DTO/IServices/IJobPostService";
import { IJobRepository } from "../interfaces/Irepositories/IjobRepository";
import { IJobPost } from "../interfaces/models/Ijob";
import { BaseRepository } from "./baseRepository";
import JobPost from "../models/jobPostSchema";
import { FilterQuery, Types } from "mongoose";


export class JobRepository
  extends BaseRepository<IJobPost>
  implements IJobRepository
{
  constructor() {
    super(JobPost);
  }

  async addJobs(
    recruiterId: string,
    jobData: IJobRequestDTO
  ): Promise<IJobPost> {
    try {
      const payload = {
        ...jobData,
        recruiterId,
      };
      const result = await this.create(payload);
      return result;
    } catch (error) {
      console.error("Error occurred while creating the job post:", error);
      throw new Error("An error occurred while creating the job post");
    }
  }

  async getAllJobs(options: {
    recruiterId: string;
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    workmode?: string;
    worktime?: string;
  }): Promise<{
    data: IJobPost[];
    total: number;
    page: number;
    limit: number;
    pages: number;
  }> {
    try {
      console.log("entering the function which fetches all the jobs");
      const page = options.page || 1;
      const limit = options.limit || 6;

      const filter: FilterQuery<IJobPost> = {};
      filter.recruiterId = options.recruiterId;

      if (options.search) {
        filter.$or = [
          { jobrole: { $regex: options.search, $options: "i" } },
          { requirements: { $regex: options.search, $options: "i" } },
        ];
      }

      if (options.status === "active") {
        filter.status = "Active";
      } else if (options.status === "blocked") {
        filter.status = "InActive";
      }

      if (options.workmode) {
        if (options.workmode === "remote") {
          filter.workMode = "remote";
        } else if (options.workmode === "on-site") {
          filter.workMode = "on-site";
        } else if (options.workmode === "hybrid") {
          filter.workMode = "hybrid";
        }
      }

      if (options.worktime) {
        if (options.worktime === "full-time") {
          filter.workTime = "full-time";
        } else if (options.worktime === "part-time") {
          filter.workTime = "part-time";
        } else if (options.worktime === "contract") {
          filter.workTime = "contract";
        } else if (options.worktime === "internship") {
          filter.workTime = "internship";
        }
      }

    

      const result = (await this.find(filter, {
        pagination: { page, limit },
        sort: { createdAt: -1 },
      })) as { data: IJobPost[]; total: number };

      console.log("data fetched from the job repository:", result);

      return {
        data: result.data,
        total: result.total,
        page,
        limit,
        pages: Math.ceil(result.total / limit),
      };
    } catch (error) {
      console.error("error occurred while fetching the jobs:", error);
      throw new Error("Failed to fetch the jobs");
    }
  }

  async updateJobPost(
    jobId: string,
    data: IJobRequestDTO
  ): Promise<IJobPost | null> {
    try {
      if (!jobId) {
        throw new Error("Invalid jobID");
      }
      const updatedJob = await this.updateOne(new Types.ObjectId(jobId), data);

      if (!updatedJob) {
        return null;
      }
      return updatedJob;
    } catch (error) {
      console.error("Error updating problem:", error);
      throw new Error("An error occurred while updating the job");
    }
  }

  async findJobById(jobId: string): Promise<IJobPost | null> {
    try {
      if (!jobId || jobId.length !== 24) {
        throw new Error("Invalid job ID format");
      }

      const job = await this.findById(jobId);
      return job;
    } catch (error) {
      console.error("Error finding job by ID:", error);
      return null;
    }
  }

  async getAllJobDetails(options: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    workmode?: string;
    worktime?: string;
  }): Promise<{
    data: IJobPost[];
    total: number;
    page: number;
    limit: number;
    pages: number;
  }> {
    try {
     
      const page = options.page || 1;
      const limit = options.limit || 6;

      const filter: FilterQuery<IJobPost> = {};

      if (options.search) {
        filter.$or = [
          { jobrole: { $regex: options.search, $options: "i" } },
          { requirements: { $regex: options.search, $options: "i" } },
        ];
      }

      if (options.status === "active") {
        filter.status = "Active";
      } else if (options.status === "blocked") {
        filter.status = "InActive";
      }

      if (options.workmode) {
        if (options.workmode === "remote") {
          filter.workMode = "remote";
        } else if (options.workmode === "on-site") {
          filter.workMode = "on-site";
        } else if (options.workmode === "hybrid") {
          filter.workMode = "hybrid";
        }
      }

      if (options.worktime) {
        if (options.worktime === "full-time") {
          filter.workTime = "full-time";
        } else if (options.worktime === "part-time") {
          filter.workTime = "part-time";
        } else if (options.worktime === "contract") {
          filter.workTime = "contract";
        } else if (options.worktime === "internship") {
          filter.workTime = "internship";
        }
      }

   

      const result = (await this.find(filter, {
        pagination: { page, limit },
        sort: { createdAt: -1 },
      })) as { data: IJobPost[]; total: number };

  

      return {
        data: result.data,
        total: result.total,
        page,
        limit,
        pages: Math.ceil(result.total / limit),
      };
    } catch (error) {
      console.error("error occurred while fetching the jobs:", error);
      throw new Error("Failed to fetch the jobs");
    }
  }

  async findJobAndUpdate(
    jobId: string,
    status: "Active" | "InActive"
  ): Promise<IJobPost | null> {
    try {
      const job = await JobPost.findOneAndUpdate(
        { _id: jobId },
        { $set: { status: status } },
        { new: true }
      );
      return job;
    } catch (error) {
      console.error(error);
      return null;
    }
  }
}
