import { IRecruiter } from "../../models/Irecruiter";

export type submitQualificationData = Pick<
  IRecruiter,
  | "companyName"
  | "companyType"
  | "yearEstablished"
  | "registrationCertificate"
>;


export interface LoginRecruiterResponse {
    success: boolean;
    message: string;
    data?: Pick<IRecruiter, "username" | "email" | "isVerified" | "status" | "emailVerify">;
    access_token?:string
    refresh_token?:string
  }

 
export interface IRecruiterResponse {
  _id: string; 
  username: string;
  email: string;
  isVerified?: boolean;
  emailVerify?: boolean;
  status?: "Active" | "InActive" | "Pending" | "Reject";
  companyName?: string;
  companyType?: string;
  yearEstablished?: string;
  phone?: number;
  registrationCertificate?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IRecruiterProfileResponse {
  username: string;
  email: string;
  phone?: number;
  companyName?: string;
  companyType?: string;
  yearEstablished?: string;
  isVerified?: boolean;
  registrationCertificate?: string;
  status?: "Active" | "InActive" | "Pending" | "Reject";
  createdAt?: Date;
}
