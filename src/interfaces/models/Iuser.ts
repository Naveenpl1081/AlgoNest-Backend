import { Document } from "mongoose";
import { IUserResponse } from "../DTO/IServices/IUserServise";

export interface IUser extends Document {
  _id: string;
  username: string;
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  github?: string;
  linkedin?: string;
  profileImage?: string;
  status: string;
  createdAt?: Date;
  updatedAt?: Date;
  isVerified?: boolean;
}

export interface UserProfile {
  username: string;
  email: string;
  createdAt?: Date;
  firstName?: string;
  lastName?: string;
  github?: string;
  linkedin?: string;
  profileImage?: string;
}

export interface UserListResponse {
  success: boolean;
  message: string;
  data?: {
    users: IUserResponse[];
    pagination: {
      total: number;
      page: number;
      pages: number;
      limit: number;
      hasNextPage: boolean;
      hasPrevPage: boolean;
    };
  };
}
