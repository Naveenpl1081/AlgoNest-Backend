import dotenv from "dotenv";
dotenv.config();

export enum OtpPurpose {
  REGISTRATION = "REGISTRATION",
  PASSWORD_RESET = "PASSWORD_RESET",
  FORGOT_PASSWORD = "FORGOT_PASSWORD",
}
export const OTP_EXPIRY_SECONDS = process.env.OTP_EXPIRY_SECONDS;
