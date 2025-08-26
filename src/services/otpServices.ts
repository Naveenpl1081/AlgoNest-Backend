import { IOTPService } from "../interfaces/Iotp/IOTP";
import { injectable } from "tsyringe";

@injectable()
export class OTPService implements IOTPService {
  async generateOTP(): Promise<string> {
    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    console.log("otp", otp);
    return otp;
  }
}
