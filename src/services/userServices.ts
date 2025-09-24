import { OtpPurpose, OTP_EXPIRY_SECONDS } from "../config/otp.config";
import { UpdateProfileDTO } from "../interfaces/DTO/IServices/IUserServise";
import { IUser, UserProfile } from "../interfaces/models/Iuser";
import { uploadToCloudinary } from "../utils/cloudinary";
import { Roles } from "../config/roles";
import {
  LoginUserData,
  SignupUserData,
  TempUserResponse,
  LoginResponse,
} from "../interfaces/DTO/IServices/IUserServise";
import { IUserService } from "../interfaces/Iserveices/IuserService";
import { inject, injectable } from "tsyringe";
import { IUserRepository } from "../interfaces/Irepositories/IuserRepository";
import { IPasswordHash } from "../interfaces/IpasswordHash/IpasswordHash";
import { IOTPService } from "../interfaces/Iotp/IOTP";
import { IEmailService } from "../interfaces/Iserveices/IEmailService";
import { IOTPRedis } from "../interfaces/Iredis/IOTPRedis";
import { IJwtService } from "../interfaces/IJwt/Ijwt";

type SortOrder = "asc" | "desc";

export interface GetUsersParams {
  search?: string;
  limit?: number;
  skip?: number;
  sortBy?: string;
  sortOrder?: SortOrder;
}

@injectable()
export class UserService implements IUserService {
  constructor(
    @inject("IUserRepository") private _userRepository: IUserRepository,
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

  async userSignUp(data: SignupUserData): Promise<TempUserResponse> {
    try {
      console.log("entering usersignup function in the user service");
      const { email, username, password } = data;
      console.log("Storing OTP for:", email);

      const existing = await this._userRepository.findByEmail(email);
      console.log("result in usersignup", existing);
      if (existing) {
        return {
          message: "user already exsist",
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
        message: "failed to create user",
        success: false,
      };
    }
  }
  async verifyOtp(
    email: string,
    otp: string
  ): Promise<{ success: boolean; message: string }> {
    console.log("Verifying OTP for:", email);
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
      await this._userRepository.createUser({
        username,
        email,
        password,
      });
    }

    await this._otpRedisService.deleteOTP(email);

    return { success: true, message: "User created successfully" };
  }

  async userLogin(data: LoginUserData): Promise<LoginResponse> {
    try {
      const { email, password } = data;

      const validUser = await this._userRepository.findByEmail(email);
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
        Roles.USER
      );
      const refresh_token = this._jwtService.generateRefreshToken(
        String(userId),
        Roles.USER
      );

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
      console.error("error", error);
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
      const user = await this._userRepository.findByEmail(email);
      console.log("user service", user);

      if (!user) {
        return { success: false, message: "User not found." };
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
      const user = await this._userRepository.findByEmail(email);
      if (!user) {
        return { success: false, message: "User not found." };
      }
      const hashedPassword = await this._passwordService.hash(newPassword);
      user.password = hashedPassword;
      await user.save();
      return { success: true, message: "Password updated successfully." };
    } catch (error) {
      console.error("Error in findOneUser:", error);
      return { success: false, message: "Failed to update password." };
    }
  }

  async getUserProfile(userId: string): Promise<UserProfile> {
    console.log("profile service reached");
    const user = await this._userRepository.findUserById(userId);
    console.log("service pro", user);

    if (!user) {
      throw new Error("User not found");
    }
    return {
      username: user.username,
      email: user.email,
      createdAt: user.createdAt,
      firstName: user.firstName,
      lastName: user.lastName,
      github: user.github,
      linkedin: user.linkedin,
      profileImage: user.profileImage,
    };
  }

  async updateProfile(data: UpdateProfileDTO): Promise<IUser | null> {
    console.log("changed data", data);
    const { userId, firstName, lastName, github, linkedin, profileImage } =
      data;
    console.log("profile image", profileImage);

    try {
      const updatedFields: Partial<IUser> = {
        firstName,
        lastName,
        github,
        linkedin,
      };

      if (profileImage) {
        const uploadedUrl = await uploadToCloudinary(profileImage);
        updatedFields.profileImage = uploadedUrl;
      }
      console.log("uploadedUrl", updatedFields.profileImage);

      const updatedUser = await this._userRepository.updateUserProfile(
        userId,
        updatedFields
      );
      return updatedUser;
    } catch (error) {
      console.error("Error updating profile:", error);
      throw new Error("Profile update failed");
    }
  }

  async getAllUsers(options: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
  }): Promise<{
    success: boolean;
    message: string;
    data?: {
      users: IUser[];
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
      const result = await this._userRepository.getAllUsers({
        page,
        limit,
        search: options.search,
        status: options.status,
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
      console.error("Error in userSignUp:", error);
      return {
        message: "failed to create user",
        success: false,
      };
    }
  }
  async findOneUser(userId: string): Promise<{
    success: boolean;
    message: string;
    data?: {
      id: string;
      status: string;
    };
  }> {
    try {
      const user = await this._userRepository.findUserById(userId);

      if (!user) {
        return {
          success: false,
          message: "user not found",
        };
      }
      const newStatus = user.status === "Active" ? "InActive" : "Active";
      console.log("userstauts", newStatus);
      const updatedUser = await this._userRepository.findUserAndUpdate(
        userId,
        newStatus
      );
      console.log("updateuser", updatedUser);
      if (!updatedUser) {
        return {
          success: false,
          message: "failed to change user data",
        };
      }
      return {
        success: true,
        message: "user updated successfully",
        data: {
          id: updatedUser._id,
          status: updatedUser?.status,
        },
      };
    } catch (error) {
      console.error("error occured:", error);
      throw error;
    }
  }
}
