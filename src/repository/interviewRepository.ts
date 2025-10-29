import { FilterQuery, Types } from "mongoose";
import { injectable } from "tsyringe";
import { IInterviewRepository } from "../interfaces/Irepositories/IinterviewRepository";
import User from "../models/userSchema";
import JobPost from "../models/jobPostSchema";
import {
  IInterview,
  IInterviewPopulated,
  IScheduledInterviewInput,
} from "../interfaces/models/Iinterview";
import Interview from "../models/interviewSchema";
import { BaseRepository } from "./baseRepository";

@injectable()
export class InterviewRepository
  extends BaseRepository<IInterview>
  implements IInterviewRepository
{
  constructor() {
    super(Interview);
  }

  async scheduleInterview(
    interviewData: Partial<IInterview>
  ): Promise<IInterview> {
    try {
      const interview = await this.create(interviewData);
      return interview;
    } catch (error) {
      console.error("Error creating interview:", error);
      throw new Error("Failed to schedule interview");
    }
  }

  async findInterviewById(id: string): Promise<IInterview | null> {
    try {
      const Interview = await this.findById(id);
      return Interview;
    } catch (error) {
      console.error(error);
      throw new Error("An error occurred while creating the Interview");
    }
  }

  async getAllInterviews(options: {
    page?: number;
    limit?: number;
    recruiterId?: string;
    candidateId?: string;
  }): Promise<{
    data: IInterview[];
    total: number;
    page: number;
    limit: number;
    pages: number;
  }> {
    try {
      console.log("Entering the function which fetches all the interviews");

      const page = options.page || 1;
      const limit = options.limit || 6;

      const filter: FilterQuery<IInterview> = {};

      if (options.candidateId) {
        filter.candidateId = options.candidateId;
      }

      if (options.recruiterId) {
        filter.recruiterId = options.recruiterId;
      }

      const result = (await this.find(filter, {
        pagination: { page, limit },
        sort: { createdAt: -1 },
        populate: [
          { path: "candidateId", select: "username email" },
          { path: "jobId", select: "jobrole" },
        ],
      })) as { data: IInterview[]; total: number };

      console.log("Data fetched from the interview repository:", result);

      return {
        data: result.data,
        total: result.total,
        page,
        limit,
        pages: Math.ceil(result.total / limit),
      };
    } catch (error) {
      console.error("Error occurred while fetching the interviews:", error);
      throw new Error("Failed to fetch the interviews");
    }
  }
  async reScheduleInterview(
    interviewId: string,
    data: IScheduledInterviewInput
  ): Promise<IInterview | null> {
    try {
      const interview = await this.updateOne(
        new Types.ObjectId(interviewId),
        data
      );
      return interview;
    } catch (error) {
      console.error("Error creating interview:", error);
      throw new Error("Failed to schedule interview");
    }
  }
  async cancelInterview(interviewId: string): Promise<IInterview | null> {
    try {
      const interview = await this.updateOne(new Types.ObjectId(interviewId), {
        status: "cancelled",
      });
      return interview;
    } catch (error) {
      console.error("Error creating interview:", error);
      throw new Error("Failed to cancel interview");
    }
  }

  async finishInterview(interviewId: string): Promise<IInterview | null> {
    try {
      const interview = await this.updateOne(new Types.ObjectId(interviewId), {
        status: "completed",
      });
      return interview;
    } catch (error) {
      console.error("Error creating interview:", error);
      throw new Error("Failed to finished interview");
    }
  }
  async interviewCompleteList(options: {
    page: number;
    limit: number;
    search?: string;
    recruiterId: string;
  }): Promise<{
    data: IInterviewPopulated[];
    total: number;
    page: number;
    limit: number;
    pages: number;
  }> {
    try {
      const filter: FilterQuery<IInterview> = {
        recruiterId: options.recruiterId,
        status: "completed",
      };
      let result;

      if (options.search) {
        const candidateIds = await User.find({
          $or: [
            { username: { $regex: options.search, $options: "i" } },
            { email: { $regex: options.search, $options: "i" } },
          ],
        }).distinct("_id");

        const jobIds = await JobPost.find({
          jobrole: { $regex: options.search, $options: "i" },
        }).distinct("_id");

        filter.$or = [
          { candidateId: { $in: candidateIds } },
          { jobId: { $in: jobIds } },
        ];
      }

      result = await this.find(filter, {
        pagination: { page: options.page, limit: options.limit },
        sort: { createdAt: -1 },
        populate: [
          { path: "candidateId", select: "username email" },
          { path: "jobId", select: "jobrole" },
        ],
      });

      const interviews = result as unknown as {
        data: IInterviewPopulated[];
        total: number;
      };

      const pages = Math.ceil(interviews.total / options.limit);

      return {
        data: interviews.data,
        total: interviews.total,
        page: options.page,
        limit: options.limit,
        pages: pages,
      };
    } catch (error) {
      console.error("Error occurred while fetching the interviews:", error);
      throw new Error("Failed to fetch the interviews");
    }
  }
}
