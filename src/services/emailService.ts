import transporter from "../config/mailTransporter";
import { OtpPurpose } from "../config/otpConfig";
import { SendEmailOptions } from "../interfaces/DTO/IServices/IUserServise";
import { IEmailService } from "../interfaces/Iserveices/IEmailService";

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
}
