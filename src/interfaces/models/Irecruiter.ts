// interfaces/models/IRecruiter.ts
import { Document, Types } from "mongoose";
import { IRecruiterResponse } from "../DTO/IServices/IRecruiterService";

export interface IRecruiter extends Document {
  _id: string | Types.ObjectId;
  username: string;
  email: string;
  password: string;
  isVerified?: boolean;
  emailVerify?: boolean;
  status?: "Active" | "InActive" | "Pending" |"Reject";
  companyName?: string;
  companyType?: string;
  yearEstablished?: string;
  phone?:number
  registrationCertificate?: string; 
  createdAt?: Date;
  updatedAt?: Date;
}


export interface IApplicants extends Document {
  _id: Types.ObjectId; 
  username: string;
  email: string;
  isVerified?: boolean;
  emailVerify?: boolean;
  password?: string;
  status?: "Active" | "InActive" | "Pending";
  companyName?: string;
  companyType?: string;
  yearEstablished?: string;
  phone?:number
  registrationCertificate?: string; 
  createdAt?: Date;
  updatedAt?: Date;
}


export interface RecruiterListResponse {
  success: boolean;
  message: string;
  data?: {
    users: IRecruiterResponse[];
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
