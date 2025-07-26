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
  data?: Pick<IUser, "username" | "email">;
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

