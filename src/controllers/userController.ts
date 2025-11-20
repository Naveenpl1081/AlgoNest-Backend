import { Request, Response } from "express";
import { IUserService } from "../interfaces/Iserveices/IuserService";
import { injectable, inject } from "tsyringe";
import { HTTP_STATUS } from "../utils/httpStatus";
import { AppError } from "../interfaces/models/IAppError";
import dotenv from "dotenv";
import { AuthenticatedRequest } from "../middleware/authMiddleware";
import { IAuthService } from "../interfaces/Iserveices/IauthService";

dotenv.config();

@injectable()
export class UserController {
  constructor(
    @inject("IUserService") private _userService: IUserService,
    @inject("GitHubService") private _githubService: IAuthService,
    @inject("LinkedInService") private _linkedinService: IAuthService
  ) {}

  async register(req: Request, res: Response): Promise<void> {
    try {
      console.log("entering the register function in the user controller");
      const data = req.body;
      console.log("data", data);
      const serviceResponse = await this._userService.userSignUp(data);
      console.log("serviceResponse in the register function", serviceResponse);
      if (serviceResponse.success) {
        res.status(HTTP_STATUS.CREATED).json(serviceResponse);
      } else {
        res
          .status(HTTP_STATUS.CONFLICT)
          .json({ message: serviceResponse.message });
      }
    } catch (err: unknown) {
      const error = err as AppError;
      res
        .status(error.statusCode || HTTP_STATUS.BAD_REQUEST)
        .json({ error: error.message });
    }
  }

  async verifyOtp(req: Request, res: Response): Promise<void> {
    try {
      console.log("reached verifyotp");
      const { otp, email } = req.body;
      console.log("otp", otp);
      const response = await this._userService.verifyOtp(email, otp);
      console.log("response", response);
      if (response.success) {
        res.status(HTTP_STATUS.OK).json(response);
      } else {
        res.status(HTTP_STATUS.BAD_REQUEST).json(response);
      }
    } catch (err: unknown) {
      const error = err as AppError;
      res
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .json({ error: error.message });
    }
  }
  async login(req: Request, res: Response): Promise<void> {
    try {
      console.log("login controller reached");
      const data = req.body;

      const response = await this._userService.userLogin(data);

      if (response.success) {
        const {
          access_token,
          refresh_token,
          data: userData,
          message,
        } = response;

        res.cookie("refresh_token", refresh_token, {
          httpOnly: true,
          secure: true,
          sameSite: "strict",
          maxAge: Number(process.env.COOKIE_MAX_AGE),
        });

        res.status(HTTP_STATUS.OK).json({
          success: true,
          message,
          access_token,
          data: userData,
        });
      } else {
        res.status(HTTP_STATUS.CONFLICT).json({ message: response.message });
      }
    } catch (err: unknown) {
      const error = err as AppError;
      res
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .json({ error: error.message || "Internal server error" });
    }
  }

  async githubCallback(req: Request, res: Response): Promise<void> {
    try {
      console.log("GitHub callback controller reached");
      const { code } = req.body;

      if (!code) {
        res.status(400).json({
          success: false,
          message: "GitHub authorization code is required",
        });
        return;
      }

      const response = await this._githubService.authLogin(code);

      if (response.success) {
        const {
          access_token,
          refresh_token,
          data: userData,
          message,
        } = response;

        res.cookie("refresh_token", refresh_token, {
          httpOnly: true,
          secure: true,
          sameSite: "strict",
          maxAge: Number(process.env.COOKIE_MAX_AGE),
        });

        res.status(HTTP_STATUS.OK).json({
          success: true,
          message,
          access_token,
          data: userData,
        });
      } else {
        res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: response.message,
        });
      }
    } catch (err: unknown) {
      const error = err as AppError;
      console.error("GitHub callback error:", err);
      res.status(500).json({
        success: false,
        error: error.message || "Internal server error",
      });
    }
  }
  async linkedinCallback(req: Request, res: Response): Promise<void> {
    try {
      console.log("LinkedIn callback controller reached");

      const { code } = req.query;

      if (!code) {
        res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: "LinkedIn authorization code is required",
        });
        return;
      }
      console.log("hello");

      const response = await this._linkedinService.authLogin(code as string);
      console.log("response", response);

      if (response.success) {
        const {
          access_token,
          refresh_token,
          data: userData,
          message,
        } = response;

        res.cookie("refresh_token", refresh_token, {
          httpOnly: true,
          secure: true,
          sameSite: "strict",
          maxAge: Number(process.env.COOKIE_MAX_AGE),
        });

        res.status(HTTP_STATUS.OK).json({
          success: true,
          message,
          data: userData,
          access_token,
        });
      } else {
        res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: response.message,
        });
      }
    } catch (err: unknown) {
      const error = err as AppError;
      console.error("LinkedIn callback error:", err);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: error.message || "Internal server error",
      });
    }
  }

  async resendOtp(req: Request, res: Response): Promise<void> {
    try {
      const { email } = req.body;

      const response = await this._userService.resendOtp(email);

      if (response.success) {
        res.status(HTTP_STATUS.OK).json(response);
      } else {
        res.status(HTTP_STATUS.BAD_REQUEST).json(response);
      }
    } catch (err: unknown) {
      const error = err as AppError;
      console.error("Resend OTP Controller Error:", err);
      res
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .json({ error: error.message || "Internal server error" });
    }
  }

  async forgotPassword(req: Request, res: Response): Promise<void> {
    try {
      console.log("forgotpassword checking enterd");
      const { email } = req.body;
      console.log("email", email);
      const response = await this._userService.forgotPassword(email);
      console.log("repsonse for checking the forgotpassword", response);
      if (response.success) {
        res.status(HTTP_STATUS.OK).json(response);
      } else {
        res.status(HTTP_STATUS.NOT_FOUND).json(response);
      }
    } catch (err: unknown) {
      const error = err as AppError;
      res
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .json({ success: false, error: error.message });
    }
  }

  async resetPassword(req: Request, res: Response): Promise<void> {
    try {
      console.log("enter the reset");
      const { email, newPassword } = req.body;
      console.log("new rest", email);
      console.log("new rest", newPassword);
      const response = await this._userService.resetPassword(
        email,
        newPassword
      );
      if (response.success) {
        res.status(HTTP_STATUS.OK).json(response);
      } else {
        res.status(HTTP_STATUS.BAD_REQUEST).json(response);
      }
    } catch (err: unknown) {
      const error = err as AppError;
      res
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .json({ success: false, error: error.message });
    }
  }

  async profile(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      console.log("reached profile");
      const userId = req.user?.id;
      console.log("userId", userId);
      if (!userId) {
        res
          .status(HTTP_STATUS.BAD_REQUEST)
          .json({ message: "User ID missing from token." });
        return;
      }

      const user = await this._userService.getUserProfile(userId);

      console.log("profile user", user);
      res.status(HTTP_STATUS.OK).json({ success: true, data: user });
    } catch (err: unknown) {
      const error = err as AppError;
      console.error("Profile error:", error);
      res
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .json({ error: error.message || "Something went wrong." });
    }
  }

  async updateProfile(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      console.log("reched profile changed");
      const userId = req.user?.id;
      console.log("userId", userId);

      const userIdFromParams = req.params.userId;
      console.log("userIdParams",userIdFromParams)
  
      if (userId !== userIdFromParams) {
        res.status(403).json({
          success: false,
          message: "You are not authorized to edit this profile",
        });
      }

      if (!userId) {
        res
          .status(HTTP_STATUS.UNAUTHORIZED)
          .json({ success: false, message: "Unauthorized" });
        return;
      }

      const { firstName, lastName, github, linkedin } = req.body;
      const profileImage = req.file?.path;
      console.log("profile ima", profileImage);

      const updatedUser = await this._userService.updateProfile({
        userId,
        firstName,
        lastName,
        github,
        linkedin,
        profileImage,
      });
      console.log(updatedUser);

      res.status(HTTP_STATUS.OK).json({ success: true, user: updatedUser });
    } catch (err: unknown) {
      const error = err as AppError;
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: error.message || "Something went wrong while updating profile",
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
    } catch (err: unknown) {
      const error = err as AppError;
      res
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .json({ success: false, error: error.message || "Logout failed" });
    }
  }

  async isPremium(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;

      if (!userId) {
        res
          .status(HTTP_STATUS.UNAUTHORIZED)
          .json({ message: "unautherized user" });
      }

      const response = await this._userService.isPremiumService(
        userId as string
      );

      res.status(HTTP_STATUS.OK).json({ data: response });
    } catch (error: any) {
      throw new Error(error);
    }
  }

  async isStandard(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;

      if (!userId) {
        res
          .status(HTTP_STATUS.UNAUTHORIZED)
          .json({ message: "unautherized user" });
      }

      const response = await this._userService.isStandardService(
        userId as string
      );

      res.status(HTTP_STATUS.OK).json({ data: response });
    } catch (error: any) {
      throw new Error(error);
    }
  }
  async isBasic(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;

      if (!userId) {
        res
          .status(HTTP_STATUS.UNAUTHORIZED)
          .json({ message: "unautherized user" });
      }

      const response = await this._userService.isBasic(userId as string);

      res.status(HTTP_STATUS.OK).json({ data: response });
    } catch (error: any) {
      throw new Error(error);
    }
  }
}
