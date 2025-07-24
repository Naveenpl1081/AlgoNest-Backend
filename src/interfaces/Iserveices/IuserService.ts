import { TempUserResponse } from "../DTO/IServices/IUserServise";
import { SignupUserData } from "../DTO/IServices/IUserServise";

export interface IUserService {
  userSignUp(data: SignupUserData): Promise<TempUserResponse>;
  verifyOtp(otp: string): Promise<{ success: boolean; message: string }>;
}
