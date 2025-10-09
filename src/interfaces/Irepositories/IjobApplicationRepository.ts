import { IJobRequestDTO } from "../DTO/IServices/IJobPostService"
import { IJobApplication, IJobApplicationInput } from "../models/Ijob"

export interface IJobApplicationRepository {
    applyJob(
      userId: string,
      recruiterId: string,
      jobId: string,
      applicationDetails: IJobApplicationInput
    ): Promise<IJobApplication>;
    getOneApplication(
      userId: string,
      jobId: string
    ): Promise<IJobApplication | null>
    getAllApplicants(options: {
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
    }>
    getFilteredApplications(
      jobId: string,
      recruiterId: string
    ): Promise<IJobApplication[]>
    updateAIShortlist(
      applicationId: string,
      status: "shortlisted" | "rejected",
      score?: number
    ): Promise<IJobApplication | null>
    getAllShortlistApplicants(options: {
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
    }> 
    findApplication(applicationId:string):Promise<IJobApplication |null>
    updateApplicationStatus(applicationId: string, status: string): Promise<IJobApplication | null> 
  }