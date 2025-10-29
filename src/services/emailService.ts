import transporter from "../config/mailTransporter.config";
import { OtpPurpose } from "../config/otp.config";
import { SendEmailOptions } from "../interfaces/DTO/IServices/IUserServise";
import { IEmailService } from "../interfaces/Iserveices/IEmailService";

interface SendResultEmailData {
  to: string;
  candidateName: string;
  result: string;
  message: string;
}

interface SendInterviewScheduleEmailData {
  to: string;
  candidateName: string;
  jobTitle: string;
  date: string;
  time: string;
  duration: string;
  meetingLink: string;
  instructions?: string;
}

export class EmailService implements IEmailService {
  async sendMail(options: SendEmailOptions): Promise<void> {
    try {
      await transporter.sendMail({
        from: `"AlgoNest" <${process.env.EMAIL_USER}>`,
        to: options.to,
        subject: options.subject,
        text: options.text,
        html: options.html,
      });
      console.log("Email sent to:", options.to);
    } catch (error) {
      console.error(" Failed to send email:", error);
      throw new Error("Failed to send email");
    }
  }

  async sendOtpEmail(
    to: string,
    otp: string,
    purpose: OtpPurpose
  ): Promise<void> {
    let subject = "Your OTP Code";
    let message = "";

    switch (purpose) {
      case OtpPurpose.REGISTRATION:
        subject = "Verify Your Email for AlgoNest Signup";
        message =
          "You're almost there! Use the OTP below to complete your registration.";
        break;

      case OtpPurpose.PASSWORD_RESET:
        subject = "Reset Your AlgoNest Password";
        message = "Use the OTP below to reset your password securely.";
        break;

      default:
        message = "Use the OTP below to proceed.";
    }

    const html = `
      <div style="font-family: sans-serif; line-height: 1.5;">
        <h2>OTP Verification</h2>
        <p>${message}</p>
        <h3 style="color: #4F46E5;">${otp}</h3>
        <p>This OTP is valid for a short time only.</p>
        <p>— Team <strong>AlgoNest</strong></p>
      </div>
    `;

    await this.sendMail({ to, subject, html });
  }
  async sendInterviewResultEmail(data: SendResultEmailData): Promise<boolean> {
    try {
      const subject =
        data.result === "selected"
          ? "Congratulations! Interview Result - AlgoNest"
          : "Interview Result Update - AlgoNest";

      const html = this.getResultEmailTemplate(
        data.candidateName,
        data.result,
        data.message
      );

      await this.sendMail({
        to: data.to,
        subject,
        html,
      });

      console.log(`Result email sent successfully to ${data.to}`);
      return true;
    } catch (error) {
      console.error("Error sending result email:", error);
      return false;
    }
  }

  
  async sendInterviewScheduleEmail(
    data: SendInterviewScheduleEmailData
  ): Promise<boolean> {
    try {
      const subject = `Interview Scheduled - ${data.jobTitle} | AlgoNest`;

      const html = this.getScheduleEmailTemplate(data);

      await this.sendMail({
        to: data.to,
        subject,
        html,
      });

      console.log(`Schedule email sent successfully to ${data.to}`);
      return true;
    } catch (error) {
      console.error("Error sending schedule email:", error);
      return false;
    }
  }

  
  private getResultEmailTemplate(
    candidateName: string,
    result: string,
    message: string
  ): string {
    const isSelected = result === "selected";
    const bgColor = isSelected ? "#10b981" : "#ef4444";
    const resultText = isSelected ? "Selected" : "Not Selected";
    const icon = isSelected ? "✓" : "✗";

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            margin: 0;
            padding: 0;
            background-color: #f4f4f4;
          }
          .container {
            max-width: 600px;
            margin: 20px auto;
            background: #ffffff;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
          }
          .header {
            background: ${bgColor};
            color: white;
            padding: 40px 20px;
            text-align: center;
          }
          .header h1 {
            margin: 0 0 15px 0;
            font-size: 28px;
            font-weight: 600;
          }
          .status-badge {
            display: inline-block;
            background: rgba(255,255,255,0.25);
            padding: 10px 25px;
            border-radius: 25px;
            font-size: 20px;
            font-weight: bold;
            letter-spacing: 0.5px;
          }
          .content {
            padding: 40px 30px;
          }
          .greeting {
            font-size: 18px;
            margin-bottom: 20px;
            color: #333;
          }
          .message-box {
            background: #f9fafb;
            padding: 25px;
            border-left: 5px solid ${bgColor};
            margin: 25px 0;
            white-space: pre-line;
            line-height: 1.8;
            border-radius: 8px;
          }
          .footer {
            background: #f9fafb;
            padding: 25px;
            text-align: center;
            font-size: 13px;
            color: #6b7280;
            border-top: 1px solid #e5e7eb;
          }
          .brand {
            color: #4F46E5;
            font-weight: bold;
          }
          .signature {
            margin-top: 30px;
            font-size: 16px;
            color: #4b5563;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎯 Interview Result</h1>
            <div class="status-badge">${icon} ${resultText}</div>
          </div>
          <div class="content">
            <p class="greeting">Dear ${candidateName},</p>
            <div class="message-box">${message}</div>
            <p>If you have any questions or concerns, please don't hesitate to reach out to us.</p>
            <div class="signature">
              <p>Best regards,<br>
              <strong>Recruitment Team</strong><br>
              <span class="brand">AlgoNest</span></p>
            </div>
          </div>
          <div class="footer">
            <p>This is an automated email from AlgoNest. Please do not reply to this message.</p>
            <p>&copy; ${new Date().getFullYear()} AlgoNest. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

 
  private getScheduleEmailTemplate(
    data: SendInterviewScheduleEmailData
  ): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            margin: 0;
            padding: 0;
            background-color: #f4f4f4;
          }
          .container {
            max-width: 600px;
            margin: 20px auto;
            background: #ffffff;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
          }
          .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 40px 20px;
            text-align: center;
          }
          .header h1 {
            margin: 0;
            font-size: 28px;
            font-weight: 600;
          }
          .content {
            padding: 40px 30px;
          }
          .greeting {
            font-size: 18px;
            margin-bottom: 20px;
          }
          .info-box {
            background: #f9fafb;
            padding: 25px;
            border-radius: 10px;
            margin: 25px 0;
            border: 1px solid #e5e7eb;
          }
          .info-row {
            display: flex;
            justify-content: space-between;
            padding: 12px 0;
            border-bottom: 1px solid #e5e7eb;
          }
          .info-row:last-child {
            border-bottom: none;
          }
          .info-label {
            font-weight: 600;
            color: #6b7280;
            font-size: 15px;
          }
          .info-value {
            color: #111827;
            font-weight: 500;
            font-size: 15px;
          }
          .meeting-link-container {
            text-align: center;
            margin: 30px 0;
          }
          .meeting-link {
            display: inline-block;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white !important;
            padding: 15px 40px;
            text-decoration: none;
            border-radius: 8px;
            font-weight: 600;
            font-size: 16px;
            box-shadow: 0 4px 10px rgba(102, 126, 234, 0.4);
            transition: transform 0.2s;
          }
          .meeting-link:hover {
            transform: translateY(-2px);
          }
          .instructions-box {
            background: #fef3c7;
            border-left: 5px solid #f59e0b;
            padding: 20px;
            margin: 25px 0;
            border-radius: 8px;
          }
          .instructions-title {
            font-weight: 600;
            color: #92400e;
            margin-bottom: 10px;
            font-size: 16px;
          }
          .instructions-text {
            color: #78350f;
            line-height: 1.8;
          }
          .footer {
            background: #f9fafb;
            padding: 25px;
            text-align: center;
            font-size: 13px;
            color: #6b7280;
            border-top: 1px solid #e5e7eb;
          }
          .brand {
            color: #4F46E5;
            font-weight: bold;
          }
          .signature {
            margin-top: 30px;
            font-size: 16px;
            color: #4b5563;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📅 Interview Scheduled</h1>
          </div>
          <div class="content">
            <p class="greeting">Dear ${data.candidateName},</p>
            <p>Great news! Your interview has been scheduled. Please find the details below:</p>
            
            <div class="info-box">
              <div class="info-row">
                <span class="info-label">📋 Position:</span>
                <span class="info-value">${data.jobTitle}</span>
              </div>
              <div class="info-row">
                <span class="info-label">📅 Date:</span>
                <span class="info-value">${data.date}</span>
              </div>
              <div class="info-row">
                <span class="info-label">🕐 Time:</span>
                <span class="info-value">${data.time}</span>
              </div>
              <div class="info-row">
                <span class="info-label">⏱️ Duration:</span>
                <span class="info-value">${data.duration}</span>
              </div>
            </div>

            ${
              data.instructions
                ? `<div class="instructions-box">
                <div class="instructions-title">📝 Important Instructions</div>
                <div class="instructions-text">${data.instructions}</div>
              </div>`
                : ""
            }

            <div class="meeting-link-container">
              <a href="${
                data.meetingLink
              }" class="meeting-link">🎥 Join Interview</a>
            </div>

            <p>Please join the meeting at the scheduled time using the button above. Make sure you have a stable internet connection and test your audio/video before the interview.</p>
            
            <p>If you need to reschedule or have any questions, please contact us as soon as possible.</p>

            <div class="signature">
              <p>Best of luck!<br>
              <strong>Recruitment Team</strong><br>
              <span class="brand">AlgoNest</span></p>
            </div>
          </div>
          <div class="footer">
            <p>This is an automated email from AlgoNest. Please do not reply to this message.</p>
            <p>&copy; ${new Date().getFullYear()} AlgoNest. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }
}
