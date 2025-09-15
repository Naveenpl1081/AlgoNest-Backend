import { injectable, inject } from "tsyringe";
import { IProblemService } from "../interfaces/Iserveices/IproblemService";
import { Request, Response } from "express";
import { HTTP_STATUS } from "../utils/httpStatus";
import {
  createErrorResponse,
  createSuccessResponse,
} from "../utils/responseHelper";

@injectable()
export class ProblemController {
  constructor(
    @inject("IProblemService") private _problemService: IProblemService
  ) {}

  async getAllProblems(req: Request, res: Response): Promise<void> {
    try {
      console.log("function fetching all the users");
      const page = parseInt(req.query.page as string) || undefined;
      const limit = parseInt(req.query.limit as string) || undefined;
      const search = (req.query.search as string) || undefined;
      const status = (req.query.status as string) || undefined;
      const verified = (req.query.verified as string) || undefined;

      console.log("status,", status);

      const serviceResponse = await this._problemService.getAllProblems({
        page,
        limit,
        search,
        status,
        verified
      });

      console.log(
        "result from the fetching all users controller:",
        serviceResponse
      );

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
              serviceResponse.message || "Failed to fetch users"
            )
          );
      }
    } catch (error: unknown) {
      console.error("Error in getAllUsers controller:", error);
      res
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .json(createErrorResponse("Error fetching users"));
    }
  }

  async addProblemController(req: Request, res: Response): Promise<void> {
    try {
      const data = req.body;
      console.log("data", data);
      const result = await this._problemService.addProblem(data);
      if (result.success) {
        res.status(HTTP_STATUS.CREATED).json({
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
      console.error("Unhandled error in addProblemController:", err.message);

      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: "Internal server error",
      });
    }
  }
  async updateProblemController(req: Request, res: Response): Promise<void> {
    try {
      const { problemId } = req.params;
      console.log("problemId", problemId);
      const data = req.body;

      const result = await this._problemService.updateProblem(problemId, data);

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
      console.error("Unhandled error in updateProblemController:", err.message);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  getProblems = async (req: Request, res: Response) => {
    try {
      const { query,difficulty } = req.query; 
      const problems = await this._problemService.getVisibleProblems(query as string,difficulty as string);
  
      res.json({
        success: true,
        message: "Problems fetched successfully",
        data: problems,
      });
    } catch (error) {
      console.error("Error in getProblems:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch problems",
      });
    }
  };
  

  async getSingleProblem(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.problemId;

      if (!id) {
        res.status(400).json({
          success: false,
          message: "Problem ID is required",
        });
        return;
      }

      const result = await this._problemService.getSingleProblem(id);

      if (!result || !result.problem) {
        res.status(404).json({
          success: false,
          message: "Problem not found",
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: result.message,
        data: result.problem,
      });
    } catch (error) {
      console.error("Error in getSingleProblem:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch problem",
      });
    }
  }

  async toggleProblemStatus(req: Request, res: Response): Promise<void> {
    try {
      console.log("enterdddd");
      const problemId = req.params.id;
      console.log("problemId,", problemId);
      const response = await this._problemService.findOneProblem(problemId);

      if (!response) {
        res.status(HTTP_STATUS.NOT_FOUND).json({
          success: false,
          message: "problem not found",
        });
        return;
      }

      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: "problem status updated successfully",
        data: response,
      });
    } catch (error) {
      console.error("Error in toggleproblemStatus:", error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: "Internal server error",
      });
    }
  }
}
