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
}
