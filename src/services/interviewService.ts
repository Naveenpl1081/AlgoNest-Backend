import { inject, injectable } from "tsyringe";
import { IInterviewRepository } from "../interfaces/Irepositories/IinterviewRepository";
import { IInterviewSerivce } from "../interfaces/Iserveices/IinterviewService";
import {
  IInterview,
  IInterviewInput,
  IScheduledInterviewInput,
} from "../interfaces/models/Iinterview";
import crypto from "crypto";
import {
  IinterviewRequestDTO,
  InterviewRequestResponse,
} from "../interfaces/DTO/IServices/IInterviewService";
import { IEmailService } from "../interfaces/Iserveices/IEmailService";

@injectable()
export class InterviewService implements IInterviewSerivce {
  constructor(
    @inject("IInterviewRepository")
    private _interviewRepository: IInterviewRepository,
    @inject("IEmailService") private _emailService: IEmailService,
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

  async reScheduleInterview(
    data: IScheduledInterviewInput
  ): Promise<{ success: boolean; message: string; data?: any }> {
    try {
      const { interviewId, ...datas } = data;

      if (!interviewId) {
        return {
          success: false,
          message: "Interview ID is required",
        };
      }

      const result = await this._interviewRepository.reScheduleInterview(
        interviewId,
        datas
      );

      return {
        success: true,
        message: "succefully rescehduled the date and time",
        data: result,
      };
    } catch (error) {
      console.error("Error in ScheduleInterview service:", error);
      return {
        success: false,
        message: "Failed to schedule interview",
      };
    }
  }

  async cancelInterview(
    interviewId: string
  ): Promise<{ success: boolean; message: string }> {
    try {
      if (!interviewId) {
        return {
          success: false,
          message: "Interview ID is required",
        };
      }

      const result = await this._interviewRepository.cancelInterview(
        interviewId
      );

      return {
        success: true,
        message: "succefully canceled the interview",
      };
    } catch (error) {
      console.error("Error in ScheduleInterview service:", error);
      return {
        success: false,
        message: "Failed to schedule interview",
      };
    }
  }

  async finishInterview(
    interviewId: string
  ): Promise<{ success: boolean; message: string }> {
    try {
      if (!interviewId) {
        return {
          success: false,
          message: "Interview ID is required",
        };
      }

      const result = await this._interviewRepository.finishInterview(
        interviewId
      );

      return {
        success: true,
        message: "succefully canceled the interview",
      };
    } catch (error) {
      console.error("Error in ScheduleInterview service:", error);
      return {
        success: false,
        message: "Failed to schedule interview",
      };
    }
  }

  async interviewCompleteService(options: {
    page: number;
    limit: number;
    search?:String
    recruiterId: string;
  }): Promise<InterviewRequestResponse> {
    try {
      const result = await this._interviewRepository.interviewCompleteList({
        page: options.page,
        limit: options.limit,
        search:options.search as string,
        recruiterId: options.recruiterId,
      });
      const mappedInterviews: IinterviewRequestDTO[] = result.data.map((interview) => ({
        _id: interview._id.toString(),
        recruiterId: interview.recruiterId.toString(),
        candidateId: interview.candidateId?._id?.toString() || interview.candidateId.toString(),
        candidateName: interview.candidateId?.username,
        candidateEmail: interview.candidateId?.email,
        jobId: interview.jobId?._id?.toString() || interview.jobId?.toString(),
        jobTitle: interview.jobId?.jobrole,
        date: interview.date,
        time: interview.time,
        duration: interview.duration,
        instructions: interview.instructions,
        roomId: interview.roomId,
        status: interview.status,
        createdAt: interview.createdAt,
        updatedAt: interview.updatedAt,
      }));
  
      return {
        message: "Successfully fetched the completed interviews",
        success: true,
        data: {
          interview: mappedInterviews,
          pagination: {
            total: result.total,
            page: result.page,
            pages: result.pages,
            limit: result.limit,
            hasNextPage: result.page < result.pages,
            hasPrevPage: result.page > 1,
          },
        },
      };
    } catch (error) {
      console.error("Error in interviewCompleteService:", error);
      return {
        success: false,
        message: "Failed to fetch completed interviews",
      };
    }
  }

  async sendInterviewResult(data: {
    interviewId: string;
    candidateEmail: string;
    candidateName: string;
    result: string;
    message: string;
    recruiterId: string;
  }): Promise<{ success: boolean; message: string }> {
    try {
      const interview = await this._interviewRepository.findInterviewById(data.interviewId);

      if (!interview) {
        return { success: false, message: "Interview not found" };
      }

      if (interview.recruiterId.toString() !== data.recruiterId) {
        return { success: false, message: "Unauthorized" };
      }

      if (interview.status !== "completed") {
        return { success: false, message: "Interview is not completed" };
      }

     
      const emailSent = await this._emailService.sendInterviewResultEmail({
        to: data.candidateEmail,
        candidateName: data.candidateName,
        result: data.result,
        message: data.message,
      });

      if (!emailSent) {
        return { success: false, message: "Failed to send email" };
      }

      return { success: true, message: "Interview result sent successfully" };
    } catch (error) {
      console.error("Error in sendInterviewResult:", error);
      return { success: false, message: "Failed to send interview result" };
    }
  }
}
