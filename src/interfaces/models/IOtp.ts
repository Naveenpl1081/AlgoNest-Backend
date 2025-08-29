import { Document } from "mongodb";
import { OtpPurpose } from "../../config/otpConfig";
export interface IOtp extends Document {
  _id: string;
  email: string;
  otp: string;
}

export interface IReddisPayload {
  username?: string;
  password?: string;
  otp: string;
  email: string;
  purpose?: OtpPurpose
}

