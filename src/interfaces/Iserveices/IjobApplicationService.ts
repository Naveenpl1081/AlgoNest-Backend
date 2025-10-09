import { ApplicantListResponse } from "../DTO/IServices/IJobApplicationService";
import { IJobApplication, IJobApplicationInput } from "../models/Ijob";

export interface IJobApplicationService {
    applyJobApplication(
        userId: string,
        jobId: string,
        data: IJobApplicationInput,
        file:any
      ): Promise<{ success: boolean; message: string; data?: any }>
      getAllApplicants(options: {
        page?: number;
        limit?: number;
        search?: string;
        status?: string;
        recruiterId?: string;
      }): Promise<ApplicantListResponse>
      aiShortlistJob(
        jobId: string,
        recruiterId: string,
        threshold: number
      ): Promise<{ success: boolean; message: string; results?: any }>
      getAllShortlistApplicants(options: {
        page?: number;
        limit?: number;
        search?: string;
        recruiterId?: string;
      }): Promise<ApplicantListResponse>
      getApplicationDetails(applicationId:string):Promise<{userId:string,jobId:string}>
      updateApplicationStatus(applicationId: string, status: string): Promise<void> 
  }