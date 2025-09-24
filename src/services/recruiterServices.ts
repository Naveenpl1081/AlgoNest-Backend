import { OtpPurpose,OTP_EXPIRY_SECONDS} from "../config/otp.config";
import { SendEmailOptions } from "../interfaces/DTO/IServices/IUserServise";

import { Roles } from "../config/roles";
import {
  LoginUserData,
  SignupUserData,
  TempUserResponse,
} from "../interfaces/DTO/IServices/IUserServise";
import {
  LoginRecruiterResponse,
  submitQualificationData,
} from "../interfaces/DTO/IServices/IRecruiterService";
import { inject, injectable } from "tsyringe";
import { IRecruiterRepository } from "../interfaces/Irepositories/IrecruiterRepository";
import { IPasswordHash } from "../interfaces/IpasswordHash/IpasswordHash";
import { IOTPService } from "../interfaces/Iotp/IOTP";
import { IEmailService } from "../interfaces/Iserveices/IEmailService";
import { IOTPRedis } from "../interfaces/Iredis/IOTPRedis";
import { IJwtService } from "../interfaces/IJwt/Ijwt";
import { IRecruiterService } from "../interfaces/Iserveices/IrecruiterService";
import { IRecruiter } from "../interfaces/models/Irecruiter";
import { IApplicants } from "../interfaces/models/Irecruiter";

@injectable()
export class RecruiterService implements IRecruiterService {
  constructor(
    @inject("IRecruiterRepository")
    private _recruiterRepository: IRecruiterRepository,
    @inject("IPasswordHash") private _passwordService: IPasswordHash,
    @inject("IOTPService") private _otpService: IOTPService,
    @inject("IEmailService") private _emailService: IEmailService,
    @inject("IOTPRedis") private _otpRedisService: IOTPRedis,
    @inject("IJwtService") private _jwtService: IJwtService
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
        OTP_EXPIRY_SECONDS!
      );

      return {
        success: true,
        email,
        message: "OTP sent successfully",
      };
    } catch (error) {
      console.error(error);
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

    if (data.purpose !== "FORGOT_PASSWORD") {
      await this._recruiterRepository.createRecruiter({
        username,
        email,
        password,
        emailVerify: true,
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

  async recruiterLogin(data: LoginUserData): Promise<LoginRecruiterResponse> {
    try {
      const { email, password } = data;

      const validUser = await this._recruiterRepository.findByEmail(email);
      if (!validUser) {
        return {
          message: "User Not Found",
          success: false,
        };
      }
      console.log("validuser", validUser);
      if (validUser.status === "InActive") {
        return {
          message: "User Blocked By Admin",
          success: false,
        };
      }

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
      const userId = String(validUser._id);
      const access_token = this._jwtService.generateAccessToken(
        userId,
        Roles.RECRUITER
      );
      const refresh_token = this._jwtService.generateRefreshToken(
        String(userId),
        Roles.RECRUITER
      );

      console.log(refresh_token);

      return {
        success: true,
        message: "Login Successful",
        data: {
          username: validUser.username,
          email: validUser.email,
          isVerified: validUser.isVerified,
          status: validUser.status,
          emailVerify: validUser.emailVerify,
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

  async resendOtp(
    email: string
  ): Promise<{ success: boolean; message: string }> {
    try {
      let redisData = await this._otpRedisService.getOTP(email);

      if (!redisData) {
        redisData = await this._otpRedisService.getBackupData(email);
        if (!redisData) {
          return {
            success: false,
            message:
              "Your OTP has expired and no data is found. Please sign up again.",
          };
        }
      }

      const otp = await this.generateAndSendOtp(email, OtpPurpose.REGISTRATION);

      await this._otpRedisService.setOTP(
        email,
        { ...redisData, otp },
        OTP_EXPIRY_SECONDS!
      );

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

  async forgotPassword(
    email: string
  ): Promise<{ success: boolean; message: string; email?: string }> {
    try {
      const user = await this._recruiterRepository.findByEmail(email);
      console.log("Recruiter service", user);

      if (!user) {
        return { success: false, message: "Recruiter not found." };
      }

      const otp = await this.generateAndSendOtp(
        email,
        OtpPurpose.FORGOT_PASSWORD
      );

      const redisPayload = {
        email,
        otp,
        purpose: OtpPurpose.FORGOT_PASSWORD,
      };

      await this._otpRedisService.setOTP(
        email,
        redisPayload,
        OTP_EXPIRY_SECONDS!
      );

      return { success: true, message: "OTP sent to your email.", email };
    } catch (error) {
      console.error("ForgotPassword Error:", error);
      return { success: false, message: "Something went wrong." };
    }
  }

  async resetPassword(
    email: string,
    newPassword: string
  ): Promise<{ success: boolean; message: string }> {
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
      console.error(error);
      return { success: false, message: "Failed to update password." };
    }
  }
  async saveRecruiterDetails(
    recruiterId: string,
    data: submitQualificationData & { profileImage?: string }
  ): Promise<{
    success: boolean;
    message: string;
    data?: {
      isVerified?: boolean;
      emailVerify?: boolean;
      status?: string;
    };
  }> {
    try {
      const recruiter = await this._recruiterRepository.updateRecruiterDetails(
        recruiterId,
        {
          ...data,
          isVerified: false,
          status: "Pending",
        }
      );

      console.log("recruiter", recruiter);

      if (!recruiter) {
        return {
          message: "failed to update the recruiter",
          success: false,
        };
      }

      return {
        success: true,
        message: "Documents submitted. It will take 24 hours for verification.",
        data: {
          isVerified: recruiter.isVerified,
          emailVerify: recruiter.emailVerify,
          status: recruiter.status,
        },
      };
    } catch (error) {
      console.error("Error saving recruiter details:", error);
      throw new Error("Unable to save recruiter details");
    }
  }

  async getAllRecruiters(options: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    company?: string;
  }): Promise<{
    success: boolean;
    message: string;
    data?: {
      users: IRecruiter[];
      pagination: {
        total: number;
        page: number;
        pages: number;
        limit: number;
        hasNextPage: boolean;
        hasPrevPage: boolean;
      };
    };
  }> {
    try {
      console.log("Function fetching all the users");
      const page = options.page || 1;
      const limit = options.limit || 5;
      const result = await this._recruiterRepository.getAllRecruiters({
        page,
        limit,
        search: options.search,
        status: options.status,
        company: options.company,
      });

      console.log("result from the user service:", result);

      return {
        success: true,
        message: "Users fetched successfully",
        data: {
          users: result.data,
          pagination: {
            total: result.total,
            page: result.page,
            pages: result.pages,
            limit: limit,
            hasNextPage: result.page < result.pages,
            hasPrevPage: page > 1,
          },
        },
      };
    } catch (error) {
      console.error("Error fetching users:", error);
      return {
        success: false,
        message: "Something went wrong while fetching users",
      };
    }
  }

  async findOneRecruiter(recruiterId: string): Promise<IRecruiter | null> {
    try {
      const recruiter = await this._recruiterRepository.findById(recruiterId);
      if (!recruiter) {
        return null;
      }
      const newStatus: "Active" | "InActive" =
        recruiter.status === "Active" ? "InActive" : "Active";
      console.log("userstauts", newStatus);
      const updatedUser =
        await this._recruiterRepository.findRecruiterAndUpdate(
          recruiterId,
          newStatus
        );
      console.log("updateuser", updatedUser);
      return updatedUser;
    } catch (error) {
      console.error("error occured:", error);
      return null;
    }
  }

  async getAllApplicants(options: { page?: number; limit?: number }): Promise<{
    success: boolean;
    message: string;
    data?: {
      users: IApplicants[];
      pagination: {
        total: number;
        page: number;
        pages: number;
        limit: number;
        hasNextPage: boolean;
        hasPrevPage: boolean;
      };
    };
  }> {
    try {
      console.log("Function fetching all the users");
      const page = options.page || 1;
      const limit = options.limit || 5;
      const result = await this._recruiterRepository.getAllApplicants({
        page,
        limit,
      });
      console.log("result from the user service:", result);

      return {
        success: true,
        message: "Users fetched successfully",
        data: {
          users: result.data,
          pagination: {
            total: result.total,
            page: result.page,
            pages: result.pages,
            limit: limit,
            hasNextPage: result.page < result.pages,
            hasPrevPage: page > 1,
          },
        },
      };
    } catch (error) {
      console.error("Error fetching users:", error);
      return {
        success: false,
        message: "Something went wrong while fetching users",
      };
    }
  }
  async acceptApplicant(
    applicantId: string
  ): Promise<{ success: boolean; message: string }> {
    try {
      const updatedResult =
        await this._recruiterRepository.updateRecruiterDetails(applicantId, {
          isVerified: true,
          status: "Active",
        });

      if (!updatedResult) {
        return {
          success: false,
          message: "can not fetch the recruiter",
        };
      }

      return {
        success: true,
        message: "Approved successfully done",
      };
    } catch (error) {
      console.error("Error saving recruiter details:", error);
      throw new Error("Unable to save recruiter details");
    }
  }

  async rejectApplicant(
    applicantId: string,
    data: string
  ): Promise<{ success: boolean; message: string }> {
    try {
      console.log("enterd the reject service");
      const updatedResult =
        await this._recruiterRepository.updateRecruiterDetails(applicantId, {
          isVerified: false,
          status: "Reject",
        });

      if (!updatedResult) {
        return {
          success: false,
          message: "can not fetch the recruiter",
        };
      }

      const emailOptions: SendEmailOptions = {
        to: updatedResult.email,
        subject: "Application Rejection Notice",
        text: data,
        html: `<p>${data}</p>`,
      };

      await this._emailService.sendMail(emailOptions);

      return {
        success: true,
        message: "Rejected successfully done",
      };
    } catch (error) {
      console.error("Error saving recruiter details:", error);
      throw new Error("Unable to save recruiter details");
    }
  }

  async getRecruiterProfile(recruiterId: string): Promise<Partial<IRecruiter>> {
    console.log("Recruiter profile service reached");
    const recruiter = await this._recruiterRepository.findById(recruiterId);

    if (!recruiter) {
      throw new Error("Recruiter not found");
    }
    return {
      username: recruiter.username,
      email: recruiter.email,
      phone: recruiter.phone,
      companyName: recruiter.companyName,
      companyType: recruiter.companyType,
      yearEstablished: recruiter.yearEstablished,
      isVerified: recruiter.isVerified,
      registrationCertificate: recruiter.registrationCertificate,
      status: recruiter.status,
      createdAt: recruiter.createdAt,
    };
  }
}
