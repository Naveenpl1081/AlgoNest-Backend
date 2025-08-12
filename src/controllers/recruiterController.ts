import { Request, Response } from "express";
import { inject, injectable } from "tsyringe";
import { IRecuiterController } from "../interfaces/Icontrollers/IrecruiterController";
import { IRecruiterService } from "../interfaces/Iserveices/IrecruiterService";
import { HTTP_STATUS } from "../utils/httpStatus";

@injectable()
export class RecruiterController implements IRecuiterController {
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
          maxAge: 3 * 24 * 60 * 60 * 1000,
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
}
