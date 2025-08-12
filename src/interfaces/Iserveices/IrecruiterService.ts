import { LoginResponse, TempUserResponse } from "../DTO/IServices/IUserServise";
import { SignupUserData,LoginUserData } from "../DTO/IServices/IUserServise";

export interface IRecruiterService {
  recruiterSignUp(data: SignupUserData): Promise<TempUserResponse>;
  verifyOtp(email:string ,otp: string): Promise<{ success: boolean; message: string }>;
  recruiterLogin(data:LoginUserData):Promise<LoginResponse>;
  resendOtp(email: string): Promise<{ success: boolean; message: string }>;
  forgotPassword(email: string): Promise<{ success: boolean; message: string; email?: string }>
  resetPassword(email: string, newPassword: string): Promise<{ success: boolean; message: string }>
}