import { LoginResponse, TempUserResponse,UpdateProfileDTO } from "../DTO/IServices/IUserServise";
import { SignupUserData,LoginUserData } from "../DTO/IServices/IUserServise";
import { IUser } from "../models/Iuser";
import { AdminUserListResponse } from "../DTO/IServices/IAdminServise";

export interface IUserService {
  userSignUp(data: SignupUserData): Promise<TempUserResponse>;
  verifyOtp(email:string ,otp: string): Promise<{ success: boolean; message: string }>;
  userLogin(data:LoginUserData):Promise<LoginResponse>;
  resendOtp(email: string): Promise<{ success: boolean; message: string }>;
  forgotPassword(email: string): Promise<{ success: boolean; message: string; email?: string }>
  resetPassword(email: string, newPassword: string): Promise<{ success: boolean; message: string }>
  getUserProfile(userId: string): Promise<any>;
  updateProfile(data: UpdateProfileDTO): Promise<IUser | null>
  getAllUsers(): Promise<AdminUserListResponse>;
  findOneUser(userId: string): Promise<IUser | null>
}
