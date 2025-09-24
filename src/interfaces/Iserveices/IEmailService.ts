import { OtpPurpose } from "../../config/otp.config";

export interface IEmailService {
  sendMail(options: {
    to: string;
    subject: string;
    text?: string;
    html?: string;
  }): Promise<void>;

  sendOtpEmail(to: string, otp: string, purpose: OtpPurpose): Promise<void>;
}
