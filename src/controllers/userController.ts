import { Request, Response } from "express";
import { IUserService } from "../interfaces/Iserveices/IuserService";
import { injectable, inject } from "tsyringe";
import { HTTP_STATUS } from "../utils/httpStatus";
import dotenv from "dotenv";
dotenv.config();
@injectable()
export class UserController {
  constructor(@inject("IUserService") private _userService: IUserService) {}

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
    } catch (err: any) {
      res.status(HTTP_STATUS.BAD_REQUEST).json({ error: err.message });
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
    } catch (err: any) {
      res
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .json({ message: err.message });
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
    } catch (err: any) {
      res
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .json({ error: err.message || "Internal server error" });
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

      const response = await this._userService.githubLogin(code);

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

        res.status(200).json({
          success: true,
          message,
          access_token,
          data: userData,
        });
      } else {
        res.status(400).json({
          success: false,
          message: response.message,
        });
      }
    } catch (err: any) {
      console.error("GitHub callback error:", err);
      res.status(500).json({
        success: false,
        error: err.message || "Internal server error",
      });
    }
  }

  async linkedinCallback(req: Request, res: Response): Promise<void> {
    try {
      console.log("LinkedIn callback controller reached");
      const { code } = req.body;

      if (!code) {
        res.status(400).json({
          success: false,
          message: "LinkedIn authorization code is required",
        });
        return;
      }

      const response = await this._userService.linkedinLogin(code);

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

        res.status(200).json({
          success: true,
          message,
          access_token,
          data: userData,
        });
      } else {
        res.status(400).json({
          success: false,
          message: response.message,
        });
      }
    } catch (err: any) {
      console.error("LinkedIn callback error:", err);
      res.status(500).json({
        success: false,
        error: err.message || "Internal server error",
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
    } catch (err: any) {
      console.error("Resend OTP Controller Error:", err);
      res
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .json({ message: "Internal server error" });
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
    } catch (error: any) {
      res
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .json({ success: false, message: error.message });
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
    } catch (error: any) {
      res
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .json({ success: false, message: error.message });
    }
  }

  async profile(req: Request, res: Response): Promise<void> {
    try {
      console.log("reached profile");
      const userId = (req as any).user?.Id;
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
    } catch (error) {
      console.error("Profile error:", error);
      res
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .json({ message: "Something went wrong." });
    }
  }

  async updateProfile(req: Request, res: Response): Promise<void> {
    try {
      console.log("reched profile changed");
      const userId = (req as any).user?.Id;
      console.log("userId", userId);
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
    } catch (error: any) {
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: error.message || "Something went wrong while updating profile",
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
}
