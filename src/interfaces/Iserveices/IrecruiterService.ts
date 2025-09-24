import { LoginResponse, TempUserResponse } from "../DTO/IServices/IUserServise";
import { SignupUserData, LoginUserData } from "../DTO/IServices/IUserServise";
import { IRecruiterProfileResponse, submitQualificationData } from "../DTO/IServices/IRecruiterService";
import { IRecruiter, RecruiterListResponse } from "../models/Irecruiter";
import { IApplicants } from "../models/Irecruiter";
import { IApplicantResponse } from "../DTO/IServices/IApplicantService";
export interface IRecruiterService {
  recruiterSignUp(data: SignupUserData): Promise<TempUserResponse>;
  verifyOtp(
    email: string,
    otp: string
  ): Promise<{ success: boolean; message: string }>;
  recruiterLogin(data: LoginUserData): Promise<LoginResponse>;
  resendOtp(email: string): Promise<{ success: boolean; message: string }>;
  forgotPassword(
    email: string
  ): Promise<{ success: boolean; message: string; email?: string }>;
  resetPassword(
    email: string,
    newPassword: string
  ): Promise<{ success: boolean; message: string }>;
  saveRecruiterDetails(
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
  }>;
  getAllRecruiters(options: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    company?: string;
  }): Promise<RecruiterListResponse>
  findOneRecruiter(recruiterId: string): Promise<IRecruiter | null>;
  getAllApplicants(options: { page?: number; limit?: number }): Promise<{
    success: boolean;
    message: string;
    data?: {
      users: IApplicantResponse[];
      pagination: {
        total: number;
        page: number;
        pages: number;
        limit: number;
        hasNextPage: boolean;
        hasPrevPage: boolean;
      };
    };
  }> 
  acceptApplicant(
    applicantId: string
  ): Promise<{ success: boolean; message: string }>;
  rejectApplicant(
    applicantId: string,
    data: string
  ): Promise<{ success: boolean; message: string }>;
  getRecruiterProfile(recruiterId: string): Promise<Partial<IRecruiterProfileResponse>>
}
