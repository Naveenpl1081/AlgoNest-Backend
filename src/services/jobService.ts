import { inject, injectable } from "tsyringe";
import {
  IJobRequestDTO,
  JobRequestResponse,
  JobResponseDto,
  UpdateJobResponseDTO,
} from "../interfaces/DTO/IServices/IJobPostService";
import { IJobRepository } from "../interfaces/Irepositories/IjobRepository";
import { IJobService } from "../interfaces/Iserveices/IjobService";

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
      if(!recruiterId){
        return {success:false,message:"recruiterId is required"}
      }
      if(!data.jobrole){
        return {success:false,message:"jobrole is required"}
      }
      if(!data.jobLocation){
        return {success:false,message:"joblocation is required"}
      }
      if(!data.maxSalary){
        return {success:false,message:"maxSalary is required"}
      }
      if(!data.minSalary){
        return {success:false,message:"minsalary is required"}
      }
      if(!data.minExperience){
        return {success:false,message:"minExperience is required"}
      }
      
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

      const mappedJob: IJobRequestDTO[] = results.data.map((job) => {
        return {
          _id: job._id,
          jobrole: job.jobrole,
          jobLocation: job.jobLocation,
          workTime: job.workTime,
          workMode: job.workMode,
          minExperience: job.minExperience,
          minSalary: job.minSalary,
          maxSalary: job.maxSalary,
          requirements: job.requirements,
          responsibilities: job.responsibilities,
          status: job.status,
        };
      });

      return {
        success: true,
        message: "Jobs fetched successfully",
        data: {
          jobs: mappedJob,
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
      console.log("result", results);

      const mappedJob: IJobRequestDTO[] = results.data.map((job) => {
        return {
          _id: job._id,
          jobrole: job.jobrole,
          jobLocation: job.jobLocation,
          workTime: job.workTime,
          workMode: job.workMode,
          minExperience: job.minExperience,
          minSalary: job.minSalary,
          maxSalary: job.maxSalary,
          requirements: job.requirements,
          responsibilities: job.responsibilities,
          status: job.status,
          recruiterId:
            typeof job.recruiterId === "object" && job.recruiterId !== null
              ? {
                  userName: job.recruiterId.username,
                  companyName: job.recruiterId.companyName,
                  companyType: job.recruiterId.companyType,
                }
              : undefined,
        };
      });

      
      return {
        success: true,
        message: "Jobs fetched successfully",
        data: {
          jobs: mappedJob,
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
        status: updatedJob.status,
      };
      return {
        success: true,
        message: "job status succefully changed",
        data: mappedData,
      };
    } catch (error) {
      console.error("error occured:", error);
      return null;
    }
  }
}
