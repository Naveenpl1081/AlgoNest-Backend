import { InterviewRequestResponse } from "../DTO/IServices/IInterviewService";
import { IInterview } from "../models/Iinterview";

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
}
