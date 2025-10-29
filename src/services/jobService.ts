import axios from "axios";
import { inject, injectable } from "tsyringe";
import {
  IJobRequestDTO,
  JobRequestResponse,
  JobResponseDto,
  UpdateJobResponseDTO,
} from "../interfaces/DTO/IServices/IJobPostService";
import { IJobRepository } from "../interfaces/Irepositories/IjobRepository";
import { IJobService } from "../interfaces/Iserveices/IjobService";
import { ServiceResponse } from "../interfaces/DTO/IServices/IJobPostService";
import { IJobPostResponse } from "../interfaces/DTO/IServices/IJobPostService";

import {
  LocationServiceResponse,
  LocationSuggestion,
} from "../interfaces/models/Ijob";

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
      if (!recruiterId) {
        return { success: false, message: "recruiterId is required" };
      }
      if (!data.jobrole) {
        return { success: false, message: "jobrole is required" };
      }
      if (!data.jobLocation) {
        return { success: false, message: "joblocation is required" };
      }
      if (!data.maxSalary) {
        return { success: false, message: "maxSalary is required" };
      }
      if (!data.minSalary) {
        return { success: false, message: "minsalary is required" };
      }
      if (!data.minExperience) {
        return { success: false, message: "minExperience is required" };
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

  async fetchLocationSuggestions(
    query: string
  ): Promise<LocationServiceResponse> {
    try {
      if (!query || query.trim().length < 3) {
        return {
          success: false,
          message: "Query must be at least 3 characters",
        };
      }

      const response = await axios.get(process.env.LOCATION_API_URL as string, {
        params: {
          q: query,
          format: "json",
          addressdetails: 1,
          limit: 5,
          countrycodes: "in",
        },
        headers: {
          "User-Agent": "YourJobPortalApp/1.0",
        },
        timeout: 5000,
      });

      if (!response.data || response.data.length === 0) {
        return {
          success: true,
          message: "No locations found",
          data: [],
        };
      }

      const locations: LocationSuggestion[] = response.data.map(
        (item: any) => ({
          display_name: item.display_name,
          lat: item.lat,
          lon: item.lon,
          place_id: item.place_id,
        })
      );

      return {
        success: true,
        message: "Locations fetched successfully",
        data: locations,
      };
    } catch (error: unknown) {
      const err = error as Error;
      console.error("Error fetching location suggestions:", err.message);
      return {
        success: false,
        message: "Failed to fetch location suggestions",
      };
    }
  }

  async getJobById(
    jobId: string
  ): Promise<ServiceResponse<IJobPostResponse | null>> {
    try {
      const job = await this._jobRepository.findJobById(jobId);

      if (!job) {
        return {
          success: false,
          message: "Job not found",
          data: null,
        };
      }

      return {
        success: true,
        message: "Job details fetched successfully",
        data: {
          _id: job._id.toString(),
          jobrole: job.jobrole,
          jobLocation: job.jobLocation,
          workTime: job.workTime,
          workMode: job.workMode,
          minExperience: job.minExperience,
          minSalary: job.minSalary,
          maxSalary: job.maxSalary,
          requirements: job.requirements,
          responsibilities: job.responsibilities,
          recruiterId: job.recruiterId.toString(),
          applicationsCount: job.applicationsCount,
          createdAt: job.createdAt.toISOString(),
          updatedAt: job.updatedAt.toISOString(),
        },
      };
    } catch (error) {
      console.error("Error fetching job by ID:", error);
      throw error;
    }
  }
}
