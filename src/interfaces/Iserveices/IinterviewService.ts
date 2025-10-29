import { InterviewRequestResponse } from "../DTO/IServices/IInterviewService";
import { IInterview, IScheduledInterviewInput } from "../models/Iinterview";

export interface IInterviewSerivce {
  ScheduleInterview(
    data: Partial<IInterview>
  ): Promise<{ success: boolean; message: string; data?: IInterview }>;
  getAllInterviews(options: {
    page?: number;
    limit?: number;
    recruiterId?: string;
    candidateId?: string;
  }): Promise<InterviewRequestResponse>;
  reScheduleInterview(
    data:IScheduledInterviewInput
  ): Promise<{ success: boolean; message: string; data?: any }>
  cancelInterview(
    interviewId:string
  ): Promise<{ success: boolean; message: string;}>
  finishInterview(
    interviewId:string
  ): Promise<{ success: boolean; message: string;}>
  interviewCompleteService(options: {
    page: number;
    limit: number;
    search?:String
    recruiterId: string;
  }): Promise<InterviewRequestResponse>
  sendInterviewResult(data: {
    interviewId: string;
    candidateEmail: string;
    candidateName: string;
    result: string;
    message: string;
    recruiterId: string;
  }): Promise<{ success: boolean; message: string }>
}
