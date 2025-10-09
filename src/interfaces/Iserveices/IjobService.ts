
import {
  IJobRequestDTO,
  JobRequestResponse,
  JobResponseDto,
  UpdateJobResponseDTO,
} from "../DTO/IServices/IJobPostService";

export interface IJobService {
  addJobPost(
    recruiterId: string,
    data: IJobRequestDTO
  ): Promise<{ success: boolean; message: string }>;

  getAllJobs(options: {
    recruiterId: string;
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    workmode?: string;
    worktime?: string;
  }): Promise<JobRequestResponse>;
  updateJob(jobId: string, data: IJobRequestDTO): Promise<UpdateJobResponseDTO>;
  getAllJobDetails(options: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    workmode?: string;
    worktime?: string;
  }): Promise<JobRequestResponse>
  findOneJob(jobId: string): Promise<JobResponseDto | null>
}
