import { Request, Response } from "express";
import { injectable, inject } from "tsyringe";
import { AdminService } from "../services/adminServices";
import { IAdminController } from "../interfaces/Icontrollers/IadminController";
import { IAdminService } from "../interfaces/Iserveices/IadminService";
import { IUserService } from "../interfaces/Iserveices/IuserService";
import { HTTP_STATUS } from "../utils/httpStatus";

@injectable()
export class AdminController implements IAdminController {
  constructor(
    @inject("IAdminService") private _adminService: IAdminService,
    @inject("IUserService") private _userService: IUserService
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
      console.log("Admin getAllUsers reached");

      const response = await this._userService.getAllUsers();

      if (response.success) {
        res.status(HTTP_STATUS.OK).json(response);
      } else {
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(response);
      }
    } catch (error: any) {
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: error.message || "Internal server error",
      });
    }
  }
  async toggleUserStatus(req: Request, res: Response): Promise<void> {
    try {
      console.log("enterdddd")
      const userId = req.params.id;
      console.log("userId,",userId)
      const response = await this._userService.findOneUser(userId);
      
      if (!response) {
        res.status(HTTP_STATUS.NOT_FOUND).json({
          success: false,
          message: "User not found"
        });
        return;
      }
      
      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: "User status updated successfully",
        data: response
      });
      
    } catch (error) {
      console.error("Error in toggleUserStatus:", error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: "Internal server error"
      });
    }
  }
}
