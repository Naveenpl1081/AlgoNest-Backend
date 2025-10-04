import { inject, injectable } from "tsyringe";
import { IJobService } from "../interfaces/Iserveices/IjobService";
import { Request, Response } from "express";
import { AuthenticatedRequest } from "../middleware/authMiddleware";
import { HTTP_STATUS } from "../utils/httpStatus";
import {
  createErrorResponse,
  createSuccessResponse,
} from "../utils/responseHelper";
import { IJobRequestDTO } from "../interfaces/DTO/IServices/IJobPostService";

@injectable()
export class JobController {
  constructor(@inject("IJobService") private _jobService: IJobService) {}

  async addJob(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const recruiterId = req.user?.id;

      if (!recruiterId) {
        res.status(HTTP_STATUS.UNAUTHORIZED).json({
          success: false,
          message: "Unauthorized",
        });
      }

      const jobDetails: IJobRequestDTO = {
        jobrole: req.body.jobrole,
        jobLocation: req.body.jobLocation,
        workTime: req.body.workTime,
        workMode: req.body.workMode,
        minExperience: req.body.minExperience,
        minSalary: req.body.minSalary,
        maxSalary: req.body.maxSalary,
        requirements: req.body.requirements,
        responsibilities: req.body.responsibilities,
      };

      const result = await this._jobService.addJobPost(
        recruiterId as string,
        jobDetails
      );

      if (!result.success) {
        res
          .status(HTTP_STATUS.NOT_COMPLETED)
          .json({ success: false, message: result.message });
      }

      res
        .status(HTTP_STATUS.CREATED)
        .json({ success: true, message: result.message });
    } catch (error) {
      const err = error as Error;
      console.error("Unhandled error in JobController.addJob:", err.message);

      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  async getAllJobs(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const recruiterId = req.user?.id;
      const page = parseInt(req.query.page as string) || undefined;
      const limit = parseInt(req.query.limit as string) || undefined;
      const search = (req.query.search as string) || undefined;
      const status = (req.query.status as string) || undefined;
      const workmode = (req.query.workmode as string) || undefined;
      const worktime = (req.query.worktime as string) || undefined;

      if (!recruiterId) {
        res
          .status(HTTP_STATUS.UNAUTHORIZED)
          .json(createErrorResponse("Unauthorized"));
        return;
      }

      const jobResponse = await this._jobService.getAllJobs({
        recruiterId,
        page,
        limit,
        search,
        status,
        workmode,
        worktime,
      });

      if (jobResponse.success) {
        res
          .status(HTTP_STATUS.OK)
          .json(createSuccessResponse(jobResponse.data, jobResponse.message));
      } else {
        res
          .status(HTTP_STATUS.BAD_REQUEST)
          .json(
            createErrorResponse(jobResponse.message || "Failed to fetch jobs")
          );
      }
    } catch (error) {
      console.error("Error in getalljobs controller:", error);
      res
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .json(createErrorResponse("Error fetching jobs"));
    }
  }

  async updateJobController(req: Request, res: Response): Promise<void> {
    try {
      const { jobId } = req.params;

      const data = req.body;

      const jobDetails: IJobRequestDTO = {
        jobrole: req.body.jobrole,
        jobLocation: req.body.jobLocation,
        workTime: req.body.workTime,
        workMode: req.body.workMode,
        minExperience: req.body.minExperience,
        minSalary: req.body.minSalary,
        maxSalary: req.body.maxSalary,
        requirements: req.body.requirements,
        responsibilities: req.body.responsibilities,
      };

      const result = await this._jobService.updateJob(jobId, jobDetails);

      if (result.success) {
        res.status(HTTP_STATUS.OK).json({
          success: true,
          message: result.message,
        });
      } else {
        res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: result.message,
        });
      }
    } catch (error: unknown) {
      const err = error as Error;
      console.error("Unhandled error in updateJobController:", err.message);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  async getAllJobDetails(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || undefined;
      const limit = parseInt(req.query.limit as string) || undefined;
      const search = (req.query.search as string) || undefined;
      const status = (req.query.status as string) || undefined;
      const workmode = (req.query.workmode as string) || undefined;
      const worktime = (req.query.worktime as string) || undefined;

      const jobResponse = await this._jobService.getAllJobDetails({
        page,
        limit,
        search,
        status,
        workmode,
        worktime,
      });

      if (jobResponse.success) {
        res
          .status(HTTP_STATUS.OK)
          .json(createSuccessResponse(jobResponse.data, jobResponse.message));
      } else {
        res
          .status(HTTP_STATUS.BAD_REQUEST)
          .json(
            createErrorResponse(jobResponse.message || "Failed to fetch jobs")
          );
      }
    } catch (error) {
      console.error("Error in getalljobs controller:", error);
      res
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .json(createErrorResponse("Error fetching jobs"));
    }
  }

  async toggleJobStatus(req: Request, res: Response): Promise<void> {
    try {
      const jobId = req.params.id;

      const response = await this._jobService.findOneJob(jobId);

      if (!response) {
        res.status(HTTP_STATUS.NOT_FOUND).json({
          success: false,
          message: "Job not found",
        });
        return;
      }

      res.status(HTTP_STATUS.OK).json(response);
    } catch (error) {
      console.error("Error in toggleUserStatus:", error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: "Internal server error",
      });
    }
  }
}
