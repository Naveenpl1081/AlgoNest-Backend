import mongoose, { Document } from "mongoose";
import { IUserResponse } from "../DTO/IServices/IUserServise";
import { ISubscriptionPlan } from "./IsubcriptionPlan";

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
  planId?: mongoose.Schema.Types.ObjectId | ISubscriptionPlan | null;
  createdAt?: Date;
  updatedAt?: Date;
  isVerified?: boolean;
}

export interface UserProfile {
  _id:string;
  username: string;
  email: string;
  createdAt?: Date;
  firstName?: string;
  lastName?: string;
  github?: string;
  linkedin?: string;
  profileImage?: string;
  subscriptionPlan?: ISubscriptionPlan | null; 

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
