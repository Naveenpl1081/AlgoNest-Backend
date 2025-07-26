import { Request, Response } from "express";
import { injectable, inject } from "tsyringe";
import { IAuthController } from "../interfaces/Icontrollers/IauthController";
import { JWTService } from "../utils/jwt";
import { Roles } from "../config/roles";

@injectable()
export class AuthController implements IAuthController {
  constructor(
    @inject(JWTService) private jwtService: JWTService
  ) {}

  async refreshTokenHandler(req: Request, res: Response): Promise<Response> {
    try {
        console.log("refreshTokenHandler enter")
        console.log("cookie set",req)
      const token = req.cookies.user_refresh_token;
      console.log("token",token)
      if (!token) {
        console.log("sdkcskdmckd")
        return res.status(401).json({ message: "No refresh token" });
      }
      
  
      const payload: any = this.jwtService.verifyRefreshToken(token);
      console.log("payload",payload)
      const newAccessToken = this.jwtService.generateAccessToken(payload.id, Roles.USER);
      console.log("newAccessToken",newAccessToken)
  
      return res.status(200).json({ access_token: newAccessToken });
    } catch (err) {
      return res.status(403).json({ message: "Invalid refresh token" });
    }
  }
  
}
