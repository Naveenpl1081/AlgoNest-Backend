import { OtpPurpose, TEMP_USER_EXPIRY_SECONDS } from "../config/otpConfig";

import { Roles } from "../config/roles";
import {
  LoginUserData,
  SignupUserData,
  TempUserResponse,
  LoginResponse,
} from "../interfaces/DTO/IServices/IUserServise";
import { inject, injectable } from "tsyringe";
import { IRecruiterRepository } from "../interfaces/Irepositories/IrecruiterRepository";
import { IPasswordHash } from "../interfaces/IpasswordHash/IpasswordHash";
import { IOTPService } from "../interfaces/Iotp/IOTP";
import { IEmailService } from "../interfaces/Iserveices/IEmailService";
import { IOTPRedis } from "../interfaces/Iredis/IOTPRedis";
import { IJwtService } from "../interfaces/IJwt/Ijwt";
import { IRecruiterService } from "../interfaces/Iserveices/IrecruiterService";

@injectable()
export class RecruiterService implements IRecruiterService {
  constructor(
    @inject("IRecruiterRepository") private _recruiterRepository: IRecruiterRepository,
    @inject("IPasswordHash") private _passwordService: IPasswordHash,
    @inject("IOTPService") private _otpService: IOTPService,
    @inject("IEmailService") private _emailService: IEmailService,
    @inject("IOTPRedis") private _otpRedisService: IOTPRedis,
    @inject("IJwtService") private _jwtService:IJwtService
  ) {}

  private async generateAndSendOtp(
    email: string,
    purpose: OtpPurpose
  ): Promise<string> {
    const otp = await this._otpService.generateOTP();
    await this._emailService.sendOtpEmail(email, otp, purpose);
    return otp;
  }

  async recruiterSignUp(data: SignupUserData): Promise<TempUserResponse> {
    try {
      console.log("entering usersignup function in the recruiter service");
      const { email, username, password } = data;
      console.log("Storing OTP for:", email);

      const existing = await this._recruiterRepository.findByEmail(email);
      console.log("result in usersignup", existing);
      if (existing) {
        return {
          message: "Recruiter already exsist",
          success: false,
        };
      }

      const hashedPassword = await this._passwordService.hash(password);
      const otp = await this.generateAndSendOtp(email, OtpPurpose.REGISTRATION);
      const redisPayload = {
        username,
        email,
        password: hashedPassword,
        otp,
      };

      await this._otpRedisService.setOTP(
        email,
        redisPayload,
        TEMP_USER_EXPIRY_SECONDS
      );

      return {
        success: true,
        email,
        message: "OTP sent successfully",
      };
    } catch (error) {
      return {
        message: "failed to create Recruiter",
        success: false,
      };
    }
  }
  async verifyOtp(
    email: string,
    otp: string
  ): Promise<{ success: boolean; message: string }> {
    console.log("Verifying recruiter OTP for:", email);
    const data = await this._otpRedisService.getOTP(email);
    console.log("redisdata", data);

    if (!data) {
      return { success: false, message: "OTP expired or invalid" };
    }

    if (data.otp !== otp) {
      return { success: false, message: "Incorrect OTP" };
    }

    const { username, password } = data;

    if(data.purpose!=="FORGOT_PASSWORD"){
      await this._recruiterRepository.createRecruiter({
        username,
        email,
        password,
      });
    }

    // await this._recruiterRepository.createRecruiter({
    //   username,
    //   email,
    //   password,
    // });

    await this._otpRedisService.deleteOTP(email);

    return { success: true, message: "Recruiter created successfully" };
  }

  async recruiterLogin(data: LoginUserData): Promise<LoginResponse> {
    try {
      const { email, password } = data;

      const validUser = await this._recruiterRepository.findByEmail(email);
      if (!validUser) {
        return {
          message: "User Not Found",
          success: false,
        };
      }
      console.log("validuser",validUser)

      const isPasswordValid = await this._passwordService.verify(
        validUser.password,
        password
      );

      if (!isPasswordValid) {
        return {
          message: "invalid Password",
          success: false,
        };
      }
      const userId=String(validUser._id)
      const access_token = this._jwtService.generateAccessToken(
        userId,
        Roles.RECRUITER
      );
      const refresh_token = this._jwtService.generateRefreshToken(String(userId),Roles.RECRUITER);
      
      console.log(refresh_token)
  
      return {
        success: true,
        message: "Login Successful",
        data: {
          username: validUser.username,
          email: validUser.email,
        },
        access_token,
        refresh_token,
      };
    } catch (error) {
      console.log("error", error);
      return {
        success: false,
        message: "error occured during the login",
      };
    }
  }

  async resendOtp(email: string): Promise<{ success: boolean; message: string }> {
    try {
   
      let redisData = await this._otpRedisService.getOTP(email);
  
      
      if (!redisData) {
        redisData = await this._otpRedisService.getBackupData(email);
        if (!redisData) {
          return {
            success: false,
            message: "Your OTP has expired and no data is found. Please sign up again.",
          };
        }
      }
  
      
      const otp = await this.generateAndSendOtp(email, OtpPurpose.REGISTRATION);
  
     
      await this._otpRedisService.setOTP(email, { ...redisData, otp }, TEMP_USER_EXPIRY_SECONDS);
  
      return {
        success: true,
        message: "OTP resent successfully!",
      };
    } catch (error) {
      console.error("Resend OTP error:", error);
      return {
        success: false,
        message: "Something went wrong while resending OTP.",
      };
    }
  }
  
  
  async forgotPassword(email: string): Promise<{ success: boolean; message: string; email?: string }> {
    try {
      const user = await this._recruiterRepository.findByEmail(email);
      console.log("Recruiter service", user);
  
      if (!user) {
        return { success: false, message: "Recruiter not found." };
      }
  
      const otp = await this.generateAndSendOtp(email, OtpPurpose.FORGOT_PASSWORD);
  
      const redisPayload = {
        email,
        otp,
        purpose: OtpPurpose.FORGOT_PASSWORD,
      };
  
      await this._otpRedisService.setOTP(email, redisPayload, TEMP_USER_EXPIRY_SECONDS);
  
      return { success: true, message: "OTP sent to your email.", email };
    } catch (error) {
      console.error("ForgotPassword Error:", error);
      return { success: false, message: "Something went wrong." };
    }
  }
  

  async resetPassword(email: string, newPassword: string): Promise<{ success: boolean; message: string }> {
    try {
      const user = await this._recruiterRepository.findByEmail(email);
      if (!user) {
        return { success: false, message: "Recruiter not found." };
      }
      const hashedPassword = await this._passwordService.hash(newPassword);
      user.password = hashedPassword;
      await user.save();
      return { success: true, message: "Password updated successfully." };
    } catch (error) {
      return { success: false, message: "Failed to update password." };
    }
  }
}
