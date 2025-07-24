import { Roles } from "../config/roles";
import { OtpPurpose, TEMP_USER_EXPIRY_SECONDS } from "../config/otpConfig";
import {
  SignupUserData,
  TempUserResponse,
} from "../interfaces/DTO/IServices/IUserServise";
import { ITempUser } from "../interfaces/models/ItemUser";
import { IUserService } from "../interfaces/Iserveices/IuserService";
import { inject, injectable } from "tsyringe";
import { IUserRepository } from "../interfaces/Irepositories/IuserRepository";
import { IPasswordHash } from "../interfaces/IpasswordHash/IpasswordHash";
import { IOTPService } from "../interfaces/Iotp/IOTP";
import { ITempUserRepository } from "../interfaces/Irepositories/ITempUserRepository";
import { IEmailService } from "../interfaces/Iserveices/IEmailService";

@injectable()
export class UserService implements IUserService {
  constructor(
    @inject("IUserRepository") private _userRepository: IUserRepository,
    @inject("IPasswordHash") private _passwordService: IPasswordHash,
    @inject("IOTPService") private _otpService: IOTPService,
    @inject("ITempUserRepository")
    private _tempUserRepository: ITempUserRepository,
    @inject("IEmailService") private _emailService: IEmailService
  ) {}

  private async generateAndSendOtp(
    email: string,
    purpose: OtpPurpose
  ): Promise<string> {
    const otp = await this._otpService.generateOTP();
    await this._emailService.sendOtpEmail(email, otp, purpose);
    return otp;
  }

  async userSignUp(data: SignupUserData): Promise<TempUserResponse> {
    try {
      console.log("entering usersignup function in the user service");
      const { email, password } = data;

      const existing = await this._userRepository.findByEmail(email);
      console.log("result in usersignup", existing);
      if (existing) {
        return {
          message: "user already exsist",
          success: false,
        };
      }

      const hashedPassword = await this._passwordService.hash(password);
      const otp = await this.generateAndSendOtp(email, OtpPurpose.REGISTRATION);

      const expiresAt = new Date(Date.now() + TEMP_USER_EXPIRY_SECONDS * 1000);
      const tempUserData = {
        ...data,
        password: hashedPassword,
        otp: otp,
        expiresAt,
      } as ITempUser;

      const response = await this._tempUserRepository.createUser(tempUserData);
      console.log("response", response);

      return {
        message: "OTP Succefully created ",
        email,
        success: true,
      };
    } catch (error) {
      return {
        message: "failed to create user",
        success: false,
      };
    }
  }
  async verifyOtp(otp: string): Promise<{ success: boolean; message: string }> {
    const user = await this._tempUserRepository.findByOtp(otp);
    console.log("user",user)
    if (!user) {
      return { success: false, message: "Invalid or expired OTP" };
    }

    const { otp: _, _id, expiresAt, createdAt, updatedAt, ...userData } = user.toObject();

    await this._userRepository.createUser(userData);
    return { success: true, message: "OTP verified successfully" };
  }
}
