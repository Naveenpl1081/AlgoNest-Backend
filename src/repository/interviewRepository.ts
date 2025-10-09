import { FilterQuery } from "mongoose";
import { injectable } from "tsyringe";
import { IInterviewRepository } from "../interfaces/Irepositories/IinterviewRepository";
import { IInterview } from "../interfaces/models/Iinterview";
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
}
