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