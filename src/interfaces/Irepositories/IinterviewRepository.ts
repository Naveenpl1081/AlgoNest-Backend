import { IInterview, IScheduledInterviewInput } from "../models/Iinterview";

export interface IInterviewRepository {
  scheduleInterview(userData: Partial<IInterview>): Promise<IInterview>;
  getAllInterviews(options: {
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
  }>;
  reScheduleInterview(
    interviewId:string,
    data:IScheduledInterviewInput
   ): Promise<IInterview | null>
   cancelInterview(
    interviewId:string,
   ): Promise<IInterview | null>
}
