import { Request, Response } from "express";
import { injectable, inject } from "tsyringe";
import { AdminService } from "../services/adminServices";
import { IAdminService } from "../interfaces/Iserveices/IadminService";
import { IUserService } from "../interfaces/Iserveices/IuserService";
import { HTTP_STATUS } from "../utils/httpStatus";
import { createSuccessResponse,createErrorResponse } from "../utils/responseHelper";
import { IRecruiterService } from "../interfaces/Iserveices/IrecruiterService";


@injectable()
export class AdminController{
  constructor(
    @inject("IAdminService") private _adminService: IAdminService,
    @inject("IUserService") private _userService: IUserService,
    @inject("IRecruiterService") private _recruiterService:IRecruiterService
  ) {}

  async login(req: Request, res: Response): Promise<void> {
    try {
      console.log("body", req.body);
      const { email, password } = req.body;

      const result = await this._adminService.loginAdmin(email, password);
      console.log("adminresult", result);

      if (result.success) {
        res.cookie("refresh_token", result.refresh_token, {
          httpOnly: true,
          secure: true,
          sameSite: "strict",
          maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        res.status(HTTP_STATUS.OK).json({
          success: true,
          message: result.message,
          access_token: result.access_token,
        });
      } else {
        console.log("entrd");
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

      console.log("status,",status)

      const serviceResponse = await this._userService.getAllUsers({
        page,
        limit,
        search,
        status,
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
  async toggleUserStatus(req: Request, res: Response): Promise<void> {
    try {
      console.log("enterdddd");
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

      console.log("status,",status)

      const serviceResponse = await this._recruiterService.getAllRecruiters({
        page,
        limit,
        search,
        status,
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

  async getAllApplicants(req:Request,res:Response):Promise<void>{
    try {
      console.log("enterd into getapplicationslist")
      const page=req.query.page?parseInt(req.query.page as string):undefined
      const limit=req.query.limit?parseInt(req.query.limit as string):undefined

      const serviceResponse = await this._recruiterService.getAllApplicants({
        page,
        limit
      });

      console.log("serviceResponse",serviceResponse)
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
      
    }
  }

  async toggleRecruiterStatus(req: Request, res: Response): Promise<void> {
    try {
      console.log("enterdddd");
      const recruiterId = req.params.id;
      console.log("userId,", recruiterId);
      const response = await this._recruiterService.findOneRecruiter(recruiterId);

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
    } catch (error: any) {
      res
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .json({ success: false, message: error.message || "Logout failed" });
    }
  }
  async acceptApplicant(req: Request, res: Response): Promise<void>{
    try {
      console.log("enterd")
      const {applicantId}=req.params

      const result=await this._recruiterService.acceptApplicant(applicantId)

      res.status(200).json(result);

    } catch (error) {
      console.log("error accoured",error)
    }
  }
}
