// interfaces/models/IRecruiter.ts
import { Document } from "mongoose";

export interface IRecruiter extends Document {
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