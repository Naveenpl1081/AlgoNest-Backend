import { IUser } from "../../models/Iuser";

export interface SignupUserData {
  username: string;
  email: string;
  password: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface LoginUserData {
  email: string;
  password: string;
}

export interface TempUserResponse {
  tempUserId?: string;
  email?: string;
  success: boolean;
  message?: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  data?: Pick<IUser, "username" | "email" | "isVerified">;
  access_token?:string
  refresh_token?:string
}

export interface SendEmailOptions {
  to: string;
  subject: string;
  text?: string;
  html?: string;
}
export interface CustomPayload {
  id: string;
  email: string;
  role?: string;
}

export interface UpdateProfileDTO {
  userId: string;
  firstName?: string;
  lastName?: string;
  github?: string;
  linkedin?: string;
  profileImage?: string ; 
}


export interface FindUsersPaginatedParams {
  search?: string;
  limit?: number;
  skip?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

