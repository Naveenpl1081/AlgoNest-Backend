import { Request, Response } from "express";
import { injectable, inject } from "tsyringe";
import { IAdminService } from "../interfaces/Iserveices/IadminService";
import { IUserService } from "../interfaces/Iserveices/IuserService";
import { HTTP_STATUS } from "../utils/httpStatus";
import {
  createSuccessResponse,
  createErrorResponse,
} from "../utils/responseHelper";
import { IRecruiterService } from "../interfaces/Iserveices/IrecruiterService";
import dotenv from "dotenv";
dotenv.config();

@injectable()
export class AdminController {
  constructor(
    @inject("IAdminService") private _adminService: IAdminService,
    @inject("IUserService") private _userService: IUserService,
    @inject("IRecruiterService") private _recruiterService: IRecruiterService
  ) {}

  async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;

      const result = await this._adminService.loginAdmin(email, password);
      

      if (result.success) {
        res.cookie("refresh_token", result.refresh_token, {
          httpOnly: true,
          secure: true,
          sameSite: "strict",
          maxAge: Number(process.env.COOKIE_MAX_AGE),
        });

        res.status(HTTP_STATUS.OK).json({
          success: true,
          message: result.message,
          access_token: result.access_token,
        });
      } else {
        res.status(HTTP_STATUS.CONFLICT).json({
          success: false,
          message: result.message,
        });
      }
    } catch (error) {
      console.error("Error in AdminController.login:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  async getAllUsers(req: Request, res: Response): Promise<void> {
    try {
      console.log("function fetching all the users");
      const page = parseInt(req.query.page as string) || undefined;
      const limit = parseInt(req.query.limit as string) || undefined;
      const search = (req.query.search as string) || undefined;
      const status = (req.query.status as string) || undefined;

      const serviceResponse = await this._userService.getAllUsers({
        page,
        limit,
        search,
        status,
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
              serviceResponse.message || "Failed to fetch users"
            )
          );
      }
    } catch (error) {
      console.error("Error in getAllUsers controller:", error);
      res
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .json(createErrorResponse("Error fetching users"));
    }
  }
  async toggleUserStatus(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.params.id;
      console.log("userId,", userId);
      const response = await this._userService.findOneUser(userId);
      

      if (!response) {
        res.status(HTTP_STATUS.NOT_FOUND).json({
          success: false,
          message: "User not found",
        });
        return;
      }

      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: "User status updated successfully",
        data: response,
      });
    } catch (error) {
      console.error("Error in toggleUserStatus:", error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  async getAllRecruiters(req: Request, res: Response): Promise<void> {
    try {
      console.log("function fetching all the users");
      const page = parseInt(req.query.page as string) || undefined;
      const limit = parseInt(req.query.limit as string) || undefined;
      const search = (req.query.search as string) || undefined;
      const status = (req.query.status as string) || undefined;
      const company = (req.query.company as string) || undefined;

      console.log("status,", status);

      const serviceResponse = await this._recruiterService.getAllRecruiters({
        page,
        limit,
        search,
        status,
        company,
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
    } catch (error) {
      console.error("Error in getAllUsers controller:", error);
      res
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .json(createErrorResponse("Error fetching users"));
    }
  }

  async getAllApplicants(req: Request, res: Response): Promise<void> {
    try {
      console.log("enterd into getapplicationslist");
      const page = req.query.page
        ? parseInt(req.query.page as string)
        : undefined;
      const limit = req.query.limit
        ? parseInt(req.query.limit as string)
        : undefined;

      const serviceResponse = await this._recruiterService.getAllApplicants({
        page,
        limit,
      });

      console.log("serviceResponse", serviceResponse);
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
    } catch (error) {
      console.error(error);
    }
  }

  async toggleRecruiterStatus(req: Request, res: Response): Promise<void> {
    try {
      console.log("enterdddd");
      const recruiterId = req.params.id;
      console.log("userId,", recruiterId);
      const response = await this._recruiterService.findOneRecruiter(
        recruiterId
      );

      if (!response) {
        res.status(HTTP_STATUS.NOT_FOUND).json({
          success: false,
          message: "User not found",
        });
        return;
      }

      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: "User status updated successfully",
        data: response,
      });
    } catch (error) {
      console.error("Error in toggleUserStatus:", error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  async logout(req: Request, res: Response): Promise<void> {
    try {
      res.clearCookie("refresh_token", {
        httpOnly: true,
        secure: true,
        sameSite: "strict",
      });

      res
        .status(HTTP_STATUS.OK)
        .json({ success: true, message: "Logged out successfully" });
    } catch (error: unknown) {
      console.error(error);

      const message = error instanceof Error ? error.message : "Logout failed";

      res
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .json({ success: false, message });
    }
  }
  async acceptApplicant(req: Request, res: Response): Promise<void> {
    try {
      console.log("enterd");
      const { applicantId } = req.params;

      const result = await this._recruiterService.acceptApplicant(applicantId);

      res.status(HTTP_STATUS.OK).json(result);
    } catch (error) {
      console.error("error accoured", error);
    }
  }
  async rejectApplicant(req: Request, res: Response): Promise<void> {
    try {
      console.log("reached");
      const { applicantId } = req.params;
      const message = req.body;
      console.log(message);
      const result = await this._recruiterService.rejectApplicant(
        applicantId,
        message.rejectReason
      );

      res.status(HTTP_STATUS.OK).json(result);
    } catch (error) {
      console.error("error accoured", error);
    }
  }
}
