import {
  IUserProfileResponse,
  LoginResponse,
  TempUserResponse,
  UpdateProfileDTO,
} from "../DTO/IServices/IUserServise";
import { SignupUserData, LoginUserData } from "../DTO/IServices/IUserServise";
import { IUser, UserListResponse, UserProfile } from "../models/Iuser";

export interface IUserService {
  userSignUp(data: SignupUserData): Promise<TempUserResponse>;
  verifyOtp(
    email: string,
    otp: string
  ): Promise<{ success: boolean; message: string }>;
  userLogin(data: LoginUserData): Promise<LoginResponse>;
  resendOtp(email: string): Promise<{ success: boolean; message: string }>;
  forgotPassword(
    email: string
  ): Promise<{ success: boolean; message: string; email?: string }>;
  resetPassword(
    email: string,
    newPassword: string
  ): Promise<{ success: boolean; message: string }>;
  getUserProfile(userId: string): Promise<UserProfile>;
  updateProfile(data: UpdateProfileDTO): Promise<IUserProfileResponse | null>
  getAllUsers(options: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
  }): Promise<UserListResponse>
  findOneUser(userId: string): Promise<{
    success: boolean;
    message: string;
    data?: {
      id: string;
      status: string;
    };
  }>;
}
