import { OtpPurpose, TEMP_USER_EXPIRY_SECONDS } from "../config/otpConfig";
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

  private async getGitHubAccessToken(code: string) {
    try {
      const response = await fetch(
        "https://github.com/login/oauth/access_token",
        {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            client_id: process.env.GITHUB_CLIENT_ID,
            client_secret: process.env.GITHUB_CLIENT_SECRET,
            code: code,
          }),
        }
      );

      const data = await response.json();
      console.log("GitHub token response:", data);
      return data;
    } catch (error) {
      console.error("Error getting GitHub access token:", error);
      throw error;
    }
  }

  async getGitHubUserData(accessToken: string) {
    try {
      const response = await fetch("https://api.github.com/user", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: "application/vnd.github.v3+json",
          "User-Agent": "YourAppName",
        },
      });

      if (!response.ok) {
        throw new Error(
          `GitHub API error: ${response.status} ${response.statusText}`
        );
      }

      const userData = await response.json();
      console.log("Basic GitHub user data:", userData);

      if (!userData.email) {
        try {
          const emailResponse = await fetch(
            "https://api.github.com/user/emails",
            {
              headers: {
                Authorization: `Bearer ${accessToken}`,
                Accept: "application/vnd.github.v3+json",
                "User-Agent": "YourAppName",
              },
            }
          );

          if (emailResponse.ok) {
            const emails = await emailResponse.json();
            console.log("GitHub emails response:", emails);

            if (Array.isArray(emails) && emails.length > 0) {
              const primaryEmail = emails.find((e) => e.primary && e.verified);
              if (primaryEmail) {
                userData.email = primaryEmail.email;
              } else {
                const verifiedEmail = emails.find((e) => e.verified);
                if (verifiedEmail) {
                  userData.email = verifiedEmail.email;
                } else {
                  userData.email = emails[0].email;
                }
              }
            }
          } else {
            const errorData = await emailResponse.json();
            console.error("Failed to fetch emails:", errorData);

            console.warn(
              "Could not access user emails. User may need to make their email public or grant additional permissions."
            );
          }
        } catch (emailError) {
          console.error("Error fetching user emails:", emailError);
        }
      }

      console.log("Final GitHub user data with email:", userData);
      return userData;
    } catch (error) {
      console.error("Error getting GitHub user data:", error);
      throw error;
    }
  }

  private async getLinkedInAccessToken(code: string) {
    try {
      const params = new URLSearchParams({
        grant_type: "authorization_code",
        code: code,
        client_id: process.env.LINKEDIN_CLIENT_ID!,
        client_secret: process.env.LINKEDIN_CLIENT_SECRET!,
        redirect_uri: process.env.LINKEDIN_REDIRECT_URI!,
      });

      const response = await fetch(
        "https://www.linkedin.com/oauth/v2/accessToken",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            Accept: "application/json",
          },
          body: params.toString(),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        console.error("LinkedIn token error:", errorData);
        throw new Error(`LinkedIn token error: ${response.status}`);
      }

      const data = await response.json();
      console.log("LinkedIn token response:", data);
      return data;
    } catch (error) {
      console.error("Error getting LinkedIn access token:", error);
      throw error;
    }
  }

  private async getLinkedInUserData(accessToken: string) {
    try {
      const response = await fetch("https://api.linkedin.com/v2/userinfo", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("LinkedIn userinfo error:", errorData);
        throw new Error(
          `LinkedIn API error: ${response.status} ${response.statusText}`
        );
      }

      const userData = await response.json();
      console.log("LinkedIn user data:", userData);

      const mappedUserData = {
        id: userData.sub,
        email: userData.email,
        name: userData.name,
        localizedFirstName: userData.given_name,
        localizedLastName: userData.family_name,
        profilePicture: userData.picture,
        publicProfileUrl: `https://www.linkedin.com/in/profile-${userData.sub}`,
      };

      console.log("Final LinkedIn user data:", mappedUserData);
      return mappedUserData;
    } catch (error) {
      console.error("Error getting LinkedIn user data:", error);
      throw error;
    }
  }

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
        TEMP_USER_EXPIRY_SECONDS
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

    // await this._userRepository.createUser({
    //   username,
    //   email,
    //   password,
    // });

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
        TEMP_USER_EXPIRY_SECONDS
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
        TEMP_USER_EXPIRY_SECONDS
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

  async githubLogin(code: string): Promise<LoginResponse> {
    try {
      console.log("GitHub login service reached");

      const tokenResponse = await this.getGitHubAccessToken(code);
      if (!tokenResponse.access_token) {
        return {
          success: false,
          message: "Failed to get GitHub access token",
        };
      }

      const userData = await this.getGitHubUserData(tokenResponse.access_token);
      if (!userData.email) {
        return {
          success: false,
          message: "Failed to get user email from GitHub",
        };
      }

      let user = await this._userRepository.findByEmail(userData.email);
      console.log("user", user);

      if (user) {
        await this._userRepository.updateUserProfile(String(user?._id), {
          github: userData.html_url,
        });
      }

      if (!user) {
        const newUser = {
          username: userData.name || userData.login,
          email: userData.email,
          password: "github_oauth",
          status: "Active",
          github: userData.html_url,
        };

        user = await this._userRepository.createUser(newUser);
      }

      if (user.status === "InActive") {
        return {
          message: "User Blocked By Admin",
          success: false,
        };
      }

      const userId = String(user._id);
      const access_token = this._jwtService.generateAccessToken(userId, "USER");
      const refresh_token = this._jwtService.generateRefreshToken(
        userId,
        "USER"
      );

      return {
        success: true,
        message: "GitHub Login Successful",
        data: {
          username: user.username,
          email: user.email,
          github: user?.github,
        },
        access_token,
        refresh_token,
      };
    } catch (error) {
      console.error("GitHub login error:", error);
      return {
        success: false,
        message: "Error occurred during GitHub login",
      };
    }
  }

  async linkedinLogin(code: string): Promise<LoginResponse> {
    try {
      console.log("LinkedIn login service reached");

      const tokenResponse = await this.getLinkedInAccessToken(code);
      if (!tokenResponse.access_token) {
        return {
          success: false,
          message: "Failed to get LinkedIn access token",
        };
      }

      const userData = await this.getLinkedInUserData(
        tokenResponse.access_token
      );
      if (!userData.email) {
        return {
          success: false,
          message: "Failed to get user email from LinkedIn",
        };
      }

      let user = await this._userRepository.findByEmail(userData.email);
      console.log("user", user);

      if (user) {
        await this._userRepository.updateUserProfile(String(user?._id), {
          linkedin:
            userData.publicProfileUrl ||
            `https://www.linkedin.com/in/profile-${userData.id}`,
        });
      }

      if (!user) {
        const newUser = {
          username:
            userData.name ||
            `${userData.localizedFirstName} ${userData.localizedLastName}`,
          email: userData.email,
          password: "linkedin_oauth",
          status: "Active",
          linkedin:
            userData.publicProfileUrl ||
            `https://www.linkedin.com/in/profile-${userData.id}`,
        };
        user = await this._userRepository.createUser(newUser);
      }

      if (user.status === "InActive") {
        return {
          message: "User Blocked By Admin",
          success: false,
        };
      }

      const userId = String(user._id);
      const access_token = this._jwtService.generateAccessToken(userId, "USER");
      const refresh_token = this._jwtService.generateRefreshToken(
        userId,
        "USER"
      );

      return {
        success: true,
        message: "LinkedIn Login Successful",
        data: {
          username: user.username,
          email: user.email,
          // linkedin: user?.linkedin,
        },
        access_token,
        refresh_token,
      };
    } catch (error) {
      console.error("LinkedIn login error:", error);
      return {
        success: false,
        message: "Error occurred during LinkedIn login",
      };
    }
  }
}
