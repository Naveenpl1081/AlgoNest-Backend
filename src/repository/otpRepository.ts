import Otp from "../models/otpSchema";

export class OtpRepository {
  async saveOtp(email: string, otp: string) {
    await Otp.deleteMany({ email });
    await Otp.create({ email, otp });
  }

  async verifyOtp(email: string, otp: string) {
    const record = await Otp.findOne({ email, otp });
    return !!record;
  }

  async deleteOtp(email: string) {
    await Otp.deleteMany({ email });
  }
}
