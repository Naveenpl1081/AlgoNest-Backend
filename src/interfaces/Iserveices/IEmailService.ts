import { OtpPurpose } from "../../config/otp.config";

export interface IEmailService {
  sendMail(options: {
    to: string;
    subject: string;
    text?: string;
    html?: string;
  }): Promise<void>;

  sendOtpEmail(to: string, otp: string, purpose: OtpPurpose): Promise<void>;

  sendInterviewResultEmail(data: {
    to: string;
    candidateName: string;
    result: string;
    message: string;
  }): Promise<boolean>;
  sendInterviewScheduleEmail(data: {
    to: string;
    candidateName: string;
    jobTitle: string;
    date: string;
    time: string;
    duration: string;
    meetingLink: string;
    instructions?: string;
  }): Promise<boolean>;
}
