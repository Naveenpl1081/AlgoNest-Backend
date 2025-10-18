import { inject, injectable } from "tsyringe";
import { Response } from "express";
import { IInterviewSerivce } from "../interfaces/Iserveices/IinterviewService";
import { AuthenticatedRequest } from "../middleware/authMiddleware";
import { IJobApplicationService } from "../interfaces/Iserveices/IjobApplicationService";
import { Types } from "mongoose";
import {
  createErrorResponse,
  createSuccessResponse,
} from "../utils/responseHelper";
import { HTTP_STATUS } from "../utils/httpStatus";
import { Roles } from "../config/roles";

@injectable()
export class InterviewController {
  constructor(
    @inject("IInterviewSerivce") private _interviewService: IInterviewSerivce,
    @inject("IJobApplicationService")
    private _jobApplicationService: IJobApplicationService
  ) {}

  async scheduleInterview(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> {
    try {
      const recruiterId = req.user?.id;
      const { applicationId, date, time, duration, instructions } = req.body;

      if (!recruiterId || !applicationId || !date || !time || !duration) {
        res
          .status(400)
          .json({ success: false, message: "Missing required fields" });
        return;
      }

      const details = await this._jobApplicationService.getApplicationDetails(
        applicationId
      );

      const interviewPayload = {
        recruiterId: new Types.ObjectId(recruiterId),
        candidateId: new Types.ObjectId(details.userId),
        jobId: new Types.ObjectId(details.jobId),
        date,
        time,
        duration,
        instructions,
      };

      const result = await this._interviewService.ScheduleInterview(
        interviewPayload
      );

      if (!result.success) {
        res.status(500).json(result);
        return;
      }

      await this._jobApplicationService.updateApplicationStatus(
        applicationId,
        "scheduled"
      );

      res.status(201).json(result);
    } catch (error) {
      console.error("Error in scheduleInterview controller:", error);
      res.status(500).json({
        success: false,
        message: "Internal Server Error",
      });
    }
  }

  async getAllInterviews(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> {
    try {
      const role = req.user?.role;
console.log(role)
      const candidateId = role == Roles.USER ? req.user?.id : "";
      const recruiterId =
        role == Roles.RECRUITER ? req.user?.id : "";

      const page = req.query.page
        ? parseInt(req.query.page as string)
        : undefined;
      const limit = req.query.limit
        ? parseInt(req.query.limit as string)
        : undefined;

        console.log("candi",candidateId)
        console.log("recruiter",recruiterId)

     

      const interviewResponse = await this._interviewService.getAllInterviews({
        page,
        limit,
        recruiterId,
        candidateId,
      });

      if (interviewResponse.success) {
        res
          .status(HTTP_STATUS.OK)
          .json(
            createSuccessResponse(
              interviewResponse.data,
              interviewResponse.message
            )
          );
      } else {
        res
          .status(HTTP_STATUS.BAD_REQUEST)
          .json(
            createErrorResponse(
              interviewResponse.message || "Failed to fetch interviews"
            )
          );
      }
    } catch (error) {
      console.error("Error in getAllInterviews controller:", error);
      res
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .json(createErrorResponse("Error fetching interviews"));
    }
  }
  async rescheduleInterview(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> {
    try {
      const recruiterId = req.user?.id;
      const { interviewId, date, time, duration, instructions } = req.body;

      if (!recruiterId || !interviewId || !date || !time || !duration) {
        res
          .status(400)
          .json({ success: false, message: "Missing required fields" });
        return;
      }

      const interviewPayload = {
        interviewId,
        date,
        time,
        duration,
        instructions,
      };

      const result = await this._interviewService.reScheduleInterview(
        interviewPayload
      );

      if (!result.success) {
        res.status(500).json(result);
        return;
      }

     

      res.status(201).json(result);
    } catch (error) {
      console.error("Error in rescheduleInterview controller:", error);
      res.status(500).json({
        success: false,
        message: "Internal Server Error",
      });
    }
  }


  async cancelInterview(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> {
    try {
      
      const {interviewId}=req.params

      if ( !interviewId ) {
        res
          .status(400)
          .json({ success: false, message: "Missing required fields" });
        return;
      }

      const result = await this._interviewService.cancelInterview(
        interviewId
      );

      if (!result.success) {
        res.status(500).json(result);
        return;
      }

     

      res.status(201).json(result);
    } catch (error) {
      console.error("Error in rescheduleInterview controller:", error);
      res.status(500).json({
        success: false,
        message: "Internal Server Error",
      });
    }
  }
}
