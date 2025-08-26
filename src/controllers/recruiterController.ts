import { Request, Response } from "express";
import { inject, injectable } from "tsyringe";
import { IRecruiterService } from "../interfaces/Iserveices/IrecruiterService";
import { HTTP_STATUS } from "../utils/httpStatus";
import { uploadToCloudinary } from "../utils/cloudinary";
import dotenv from "dotenv";
dotenv.config();

@injectable()
export class RecruiterController {
  constructor(
    @inject("IRecruiterService") private _recruiterService: IRecruiterService
  ) {}

  async register(req: Request, res: Response): Promise<void> {
    try {
      console.log("entering the register function in the user controller");
      const data = req.body;
      console.log("data", data);
      const serviceResponse = await this._recruiterService.recruiterSignUp(
        data
      );
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
      const response = await this._recruiterService.verifyOtp(email, otp);
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

      const response = await this._recruiterService.recruiterLogin(data);

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
        res.status(HTTP_STATUS.CONFLICT).json({ message: response.message });
      }
    } catch (err: any) {
      res
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .json({ error: err.message || "Internal server error" });
    }
  }

  async resendOtp(req: Request, res: Response): Promise<void> {
    try {
      const { email } = req.body;

      const response = await this._recruiterService.resendOtp(email);

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
      const response = await this._recruiterService.forgotPassword(email);
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
      const response = await this._recruiterService.resetPassword(
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

  async submitDocuments(req: Request, res: Response): Promise<void> {
    try {
      const recruiterId = (req as any).user?.Id || (req as any).recruiter?.Id;

      console.log("recruiterId", recruiterId);

      if (!recruiterId) {
        res.status(401).json({
          success: false,
          message: "Unauthorized: Recruiter ID missing in token",
        });
        return;
      }

      const data = req.body;
      console.log(data);

      let imageUrl: string | undefined;
      console.log("imageUrl", imageUrl);

      if (req.file) {
        console.log("File received:", req.file.path);
        imageUrl = await uploadToCloudinary(req.file.path);
      }

      const result = await this._recruiterService.saveRecruiterDetails(
        recruiterId,
        { ...data, registrationCertificate: imageUrl }
      );

      res.status(200).json({
        success: result.success,
        message: result.message,
        data: result.data,
      });
    } catch (error: any) {
      console.error("Submit Documents Error:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Failed to submit documents",
      });
    }
  }

  async profile(req: Request, res: Response): Promise<void> {
    try {
      console.log("Reached recruiter profile");
      const recruiterId = (req as any).user?.Id;

      if (!recruiterId) {
        res
          .status(HTTP_STATUS.BAD_REQUEST)
          .json({ message: "Recruiter ID missing from token." });
        return;
      }

      const recruiter = await this._recruiterService.getRecruiterProfile(
        recruiterId
      );

      res.status(HTTP_STATUS.OK).json({ success: true, data: recruiter });
    } catch (error) {
      console.error("Recruiter profile error:", error);
      res
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .json({ message: "Something went wrong." });
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
