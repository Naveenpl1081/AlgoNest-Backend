import { inject, injectable } from "tsyringe";
import {
  IJobRequestDTO,
  JobRequestResponse,
  UpdateJobResponseDTO,
} from "../interfaces/DTO/IServices/IJobPostService";
import { IJobRepository } from "../interfaces/Irepositories/IjobRepository";
import { IJobService } from "../interfaces/Iserveices/IjobService";

export interface IJobResponse {
  _id: string;
  jobrole: string;
  jobLocation: string;
  workTime: "full-time" | "part-time" | "contract" | "internship";
  workMode: "remote" | "on-site" | "hybrid";
  minExperience: number;
  minSalary: number;
  maxSalary: number;
  requirements: string[];
  responsibilities: string[];
  recruiterId: string;
  status?: "Active" | "InActive";
  applicationsCount: number;
}

export interface JobResponseDto{
  success:boolean,
  message:string,
  data:IJobResponse
}

@injectable()
export class JobService implements IJobService {
  constructor(
    @inject("IJobRepository") private _jobRepository: IJobRepository
  ) {}
  async addJobPost(
    recruiterId: string,
    data: IJobRequestDTO
  ): Promise<{ success: boolean; message: string }> {
    try {
   
      await this._jobRepository.addJobs(recruiterId, data);
      return {
        success: true,
        message: "Successfully added job post",
      };
    } catch (error: unknown) {
      const err = error as Error;
      return {
        success: false,
        message: err.message || "Failed to add job post",
      };
    }
  }

  async getAllJobs(options: {
    recruiterId: string;
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    workmode?: string;
    worktime?: string;
  }): Promise<JobRequestResponse> {
    try {
      const page = options.page || 1;
      const limit = options.limit || 6;

      const results = await this._jobRepository.getAllJobs({
        recruiterId: options.recruiterId,
        page,
        limit,
        search: options.search,
        status: options.status,
        workmode: options.workmode,
        worktime: options.worktime,
      });

      

      return {
        success: true,
        message: "Jobs fetched successfully",
        data: {
          jobs: results.data,
          pagination: {
            total: results.total,
            page: results.page,
            pages: results.pages,
            limit,
            hasNextPage: results.page < results.pages,
            hasPrevPage: page > 1,
          },
        },
      };
    } catch (error) {
      console.error("Error fetching jobs:", error);
      return {
        success: false,
        message: "Something went wrong while fetching jobs",
      };
    }
  }

  async updateJob(
    jobId: string,
    data: IJobRequestDTO
  ): Promise<UpdateJobResponseDTO> {
    try {
      const existingJob = await this._jobRepository.findJobById(jobId);

      if (!existingJob) {
        return { success: false, message: "Job not found" };
      }

      await this._jobRepository.updateJobPost(jobId, data);
      return {
        success: true,
        message: "succefully update the job",
      };
    } catch (error) {
      const err = error as Error;
      console.error("Error in updateJob service:", err.message);
      return {
        success: false,
        message: err.message || "Failed to update JOB",
      };
    }
  }
  async getAllJobDetails(options: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    workmode?: string;
    worktime?: string;
  }): Promise<JobRequestResponse> {
    try {
      const page = options.page || 1;
      const limit = options.limit || 6;

      const results = await this._jobRepository.getAllJobDetails({
        page,
        limit,
        search: options.search,
        status: options.status,
        workmode: options.workmode,
        worktime: options.worktime,
      });

     

      return {
        success: true,
        message: "Jobs fetched successfully",
        data: {
          jobs: results.data,
          pagination: {
            total: results.total,
            page: results.page,
            pages: results.pages,
            limit,
            hasNextPage: results.page < results.pages,
            hasPrevPage: page > 1,
          },
        },
      };
    } catch (error) {
      console.error("Error fetching jobs:", error);
      return {
        success: false,
        message: "Something went wrong while fetching jobs",
      };
    }
  }
  async findOneJob(jobId: string): Promise<JobResponseDto | null> {
    try {
      const job = await this._jobRepository.findJobById(jobId);
      if (!job) {
        return null;
      }
      const newStatus: "Active" | "InActive" =
        job.status === "Active" ? "InActive" : "Active";
    
      const updatedJob = await this._jobRepository.findJobAndUpdate(
        jobId,
        newStatus
      );
      if (!updatedJob) {
        return null;
      }
      const mappedData = {
        _id: updatedJob._id,
        jobrole: updatedJob.jobrole,
        jobLocation: updatedJob.jobLocation,
        workTime: updatedJob.workTime,
        workMode: updatedJob.workMode,
        minExperience: updatedJob.minExperience,
        minSalary: updatedJob.minSalary,
        maxSalary: updatedJob.maxSalary,
        requirements: updatedJob.requirements,
        responsibilities: updatedJob.responsibilities,
        recruiterId: updatedJob.recruiterId,
        status: updatedJob.status,
        applicationsCount: updatedJob.applicationsCount,
      };
      return{
        success:true,
        message:"job status succefully changed",
        data:mappedData
      }
    } catch (error) {
      console.error("error occured:", error);
      return null;
    }
  }
}
