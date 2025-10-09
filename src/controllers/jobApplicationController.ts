import { inject, injectable } from "tsyringe";
import { Request, Response } from "express";
import { AuthenticatedRequest } from "../middleware/authMiddleware";
import { HTTP_STATUS } from "../utils/httpStatus";
import { IJobApplicationService } from "../interfaces/Iserveices/IjobApplicationService";
import {
  createErrorResponse,
  createSuccessResponse,
} from "../utils/responseHelper";

@injectable()
export class JobApplicationController {
  constructor(
    @inject("IJobApplicationService")
    private _jobApplicationService: IJobApplicationService
  ) {}

  async applyJob(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const files = req.files as { [fieldname: string]: Express.Multer.File[] };
      const userId = req.user?.id;

      if (!userId) {
        res.status(HTTP_STATUS.UNAUTHORIZED).json({
          success: false,
          message: "Unauthorized: User ID not found",
        });
        return;
      }

      const { jobId, ...restData } = req.body;
      if (!jobId) {
        res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: "Job ID is required",
        });
        return;
      }

      const result = await this._jobApplicationService.applyJobApplication(
        userId,
        jobId,
        restData,
        files
      );

      if (!result.success) {
        res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: result.message,
        });
        return;
      }

      res.status(HTTP_STATUS.CREATED).json({
        success: true,
        message: result.message,
        data: result.data,
      });
    } catch (error) {
      const err = error as Error;
      console.error("Error in JobController.applyJob:", err.message);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: "Internal Server Error",
      });
    }
  }

  async getAllApplicants(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || undefined;
      const limit = parseInt(req.query.limit as string) || undefined;
      const search = (req.query.search as string) || undefined;
      const status = (req.query.status as string) || undefined;
      const recruiterId = req.user?.id;

      const serviceResponse =
        await this._jobApplicationService.getAllApplicants({
          page,
          limit,
          search,
          status,
          recruiterId,
        });

      if (serviceResponse.success) {
        res
          .status(HTTP_STATUS.OK)
          .json(
            createSuccessResponse(serviceResponse.data, serviceResponse.message)
          );
      } else {
        res
          .status(HTTP_STATUS.BAD_REQUEST)
          .json(
            createErrorResponse(
              serviceResponse.message || "Failed to fetch applicants"
            )
          );
      }
    } catch (error) {
      console.error("Error in getAllApplicants controller:", error);
      res
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .json(createErrorResponse("Error fetching applicants"));
    }
  }

  async getAllShortlistApplicants(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || undefined;
      const limit = parseInt(req.query.limit as string) || undefined;
      const search = (req.query.search as string) || undefined;
      const recruiterId = req.user?.id;

      const serviceResponse =
        await this._jobApplicationService.getAllShortlistApplicants({
          page,
          limit,
          search,
          recruiterId,
        });

      if (serviceResponse.success) {
        res
          .status(HTTP_STATUS.OK)
          .json(
            createSuccessResponse(serviceResponse.data, serviceResponse.message)
          );
      } else {
        res
          .status(HTTP_STATUS.BAD_REQUEST)
          .json(
            createErrorResponse(
              serviceResponse.message || "Failed to fetch applicants"
            )
          );
      }
    } catch (error) {
      console.error("Error in getAllApplicants controller:", error);
      res
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .json(createErrorResponse("Error fetching applicants"));
    }
  }

  async aiShortlist(req: AuthenticatedRequest, res: Response) {
    try {
      const jobId = req.params.jobId;
      const { threshold = 70 } = req.body;
      const recruiterId = req.user?.id;

      if (!recruiterId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const numThreshold = Number(threshold);
      if (isNaN(numThreshold) || numThreshold < 0 || numThreshold > 100) {
        return res.status(400).json({
          message: "Threshold must be a number between 0 and 100",
        });
      }

      const result = await this._jobApplicationService.aiShortlistJob(
        jobId,
        recruiterId,
        numThreshold
      );

      return res.status(200).json(result);
    } catch (err: any) {
      console.error("AI Shortlist Error:", err);
      return res.status(500).json({
        message: err.message || "Failed to process AI shortlisting",
      });
    }
  }
}
