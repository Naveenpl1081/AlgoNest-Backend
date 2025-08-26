import { injectable, inject } from "tsyringe";
import { IPasswordHash } from "../interfaces/IpasswordHash/IpasswordHash";
import { IJwtService } from "../interfaces/IJwt/Ijwt";
import { Roles } from "../config/roles";
import { AdminLoginResponse } from "../interfaces/DTO/IServices/IAdminServise";
import { IAdminService } from "../interfaces/Iserveices/IadminService";
import { IAdminRepository } from "../interfaces/Irepositories/IadminRepository";

@injectable()
export class AdminService implements IAdminService {
  constructor(
    @inject("IAdminRepository") private _adminRepository: IAdminRepository,
    @inject("IPasswordHash") private _passwordService: IPasswordHash,
    @inject("IJwtService") private _jwtService: IJwtService
  ) {}

  async loginAdmin(
    email: string,
    password: string
  ): Promise<AdminLoginResponse> {
    try {
      const admin = await this._adminRepository.findByEmail(email);
      console.log("admin", admin);
      if (!admin) {
        return {
          success: false,
          message: "admin not found",
        };
      }

      const isPasswordMatch = await this._passwordService.verify(
        admin.password,
        password
      );
      if (!isPasswordMatch) {
        return {
          success: false,
          message: "invalid password",
        };
      }

      const userId = admin._id;
      const access_token = this._jwtService.generateAccessToken(
        String(userId),
        Roles.ADMIN
      );

      const refresh_token = this._jwtService.generateRefreshToken(
        String(userId),
        Roles.ADMIN
      );

      return {
        message: "admin login success",
        success: true,
        access_token: access_token,
        refresh_token: refresh_token,
      };
    } catch (error) {
      console.log("error", error);
      return {
        success: false,
        message: "error occured during the admin login",
      };
    }
  }
}
