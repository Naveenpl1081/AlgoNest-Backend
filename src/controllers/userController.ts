import { Request, Response } from "express";
import { IUserService } from "../interfaces/Iserveices/IuserService";
import { IUserController } from "../interfaces/Icontrollers/IuserController";
import { injectable, inject } from "tsyringe";

@injectable()
export class UserController implements IUserController {
  constructor(@inject("IUserService") private _userService: IUserService) {}

  async register(req: Request, res: Response): Promise<void> {
    try {
      console.log("entering the register function in the user controller");
      const data = req.body;
      console.log("data", data);
      const serviceResponse = await this._userService.userSignUp(data);
      console.log("serviceResponse in the register function", serviceResponse);
      if (serviceResponse.success) {
        res.status(201).json(serviceResponse);
      } else {
        res.status(409).json({ message: serviceResponse.message });
      }
    } catch (err: any) {
      res.status(400).json({ error: err.message });
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
        res.status(200).json(response);
      } else {
        res.status(400).json(response);
      }
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  }
  async login(req: Request, res: Response): Promise<void> {
    try {
      console.log("login controller reached");
      const data = req.body;
  
      const response = await this._userService.userLogin(data);
  
      if (response.success) {
        
        const { access_token, refresh_token, data: userData, message } = response;
  
        res.cookie("user_refresh_token", refresh_token, {
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
        res.status(409).json({ message: response.message });
      }
    } catch (err: any) {
      res.status(500).json({ error: err.message || "Internal server error" });
    }
  }

  async resendOtp(req: Request, res: Response): Promise<void> {
    try {
      const { email } = req.body;

      const response = await this._userService.resendOtp(email);

      if (response.success) {
        res.status(200).json(response);
      } else {
        res.status(400).json(response);
      }
    } catch (err: any) {
      console.error("Resend OTP Controller Error:", err);
      res.status(500).json({ message: "Internal server error" });
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
        res.status(200).json(response);
      } else {
        res.status(404).json(response);
      }
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
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
        res.status(200).json(response);
      } else {
        res.status(400).json(response);
      }
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
}
