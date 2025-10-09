import { inject, injectable } from "tsyringe";
import { IInterviewRepository } from "../interfaces/Irepositories/IinterviewRepository";
import { IInterviewSerivce } from "../interfaces/Iserveices/IinterviewService";
import { IInterview, IInterviewInput } from "../interfaces/models/Iinterview";
import crypto from "crypto";
import {
  IinterviewRequestDTO,
  InterviewRequestResponse,
} from "../interfaces/DTO/IServices/IInterviewService";

@injectable()
export class InterviewService implements IInterviewSerivce {
  constructor(
    @inject("IInterviewRepository")
    private _interviewRepository: IInterviewRepository
  ) {}

  async ScheduleInterview(
    data: Partial<IInterviewInput>
  ): Promise<{ success: boolean; message: string; data?: any }> {
    try {
      const roomId = crypto.randomBytes(8).toString("hex");
      const interviewData: Partial<IInterview> = {
        ...data,
        roomId,
        status: "scheduled",
      };

      const newInterview = await this._interviewRepository.scheduleInterview(
        interviewData
      );

      const mappedData = {
        _id: newInterview._id,
        recruiterId: newInterview.recruiterId,
        candidateId: newInterview.candidateId,
        jobId: newInterview.jobId,
        date: newInterview.date,
        time: newInterview.time,
        duration: newInterview.duration,
        instructions: newInterview.instructions,
        roomId: newInterview.roomId,
        status: newInterview.status,
        createdAt: newInterview.createdAt,
      };

      return {
        success: true,
        message: "Interview scheduled successfully",
        data: mappedData,
      };
    } catch (error) {
      console.error("Error in ScheduleInterview service:", error);
      return {
        success: false,
        message: "Failed to schedule interview",
      };
    }
  }

  async getAllInterviews(options: {
    page?: number;
    limit?: number;
    recruiterId?: string;
    candidateId?: string;
  }): Promise<InterviewRequestResponse> {
    try {
      const page = options.page;
      const limit = options.limit;
      const candidateId = options.candidateId;
      const recruiterId = options.recruiterId;

      const results = await this._interviewRepository.getAllInterviews({
        page,
        limit,
        recruiterId,
        candidateId,
      });

      console.log("results", results);

      const mappedInterviews: IinterviewRequestDTO[] = results.data.map(
        (interview: any) => {
          return {
            _id: interview._id.toString(),
            recruiterId: interview.recruiterId.toString(),

            candidateId: interview.candidateId?._id
              ? {
                  _id: interview.candidateId._id.toString(),
                  username: interview.candidateId.username,
                  email: interview.candidateId.email,
                }
              : interview.candidateId?.toString() || "",

            jobId: interview.jobId?._id
              ? {
                  _id: interview.jobId._id.toString(),
                  jobrole: interview.jobId.jobrole,
                }
              : interview.jobId?.toString() || "",

            date: interview.date,
            time: interview.time,
            duration: interview.duration,
            instructions: interview.instructions,
            roomId: interview.roomId,
            status: interview.status || "scheduled",
            createdAt: interview.createdAt,
            updatedAt: interview.updatedAt,
          };
        }
      );

      return {
        success: true,
        message: "Interviews fetched successfully",
        data: {
          interview: mappedInterviews,
          pagination: {
            total: results.total,
            page: results.page,
            pages: results.pages,
            limit: results.limit,
            hasNextPage: results.page < results.pages,
            hasPrevPage: results.page > 1,
          },
        },
      };
    } catch (error) {
      console.error("Error fetching interviews:", error);
      return {
        success: false,
        message: "Something went wrong while fetching interviews",
      };
    }
  }
}
