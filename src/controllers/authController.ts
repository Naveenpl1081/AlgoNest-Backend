import { Request, Response } from "express";
import { injectable, inject } from "tsyringe";
import { IAuthController } from "../interfaces/Icontrollers/IauthController";
import { JWTService } from "../utils/jwt";
import { Roles } from "../config/roles";
import { HTTP_STATUS } from "../utils/httpStatus";

@injectable()
export class AuthController implements IAuthController {
  constructor(@inject(JWTService) private jwtService: JWTService) {}

  async refreshTokenHandler(req: Request, res: Response): Promise<Response> {
    try {
      console.log("refreshTokenHandler enter");
      const token = req.cookies.refresh_token;
      console.log("token", token);

      if (!token) {
        return res
          .status(HTTP_STATUS.UNAUTHORIZED)
          .json({ message: "No refresh token" });
      }

      const payload: any = this.jwtService.verifyRefreshToken(token);
      console.log("payload", payload);

      const userRole = payload.role;
      if (!userRole) {
        return res
          .status(HTTP_STATUS.FORBIDDEN)
          .json({ message: "Invalid role in token" });
      }

      const newAccessToken = this.jwtService.generateAccessToken(
        payload.id,
        userRole
      );
      console.log("newAccessToken", newAccessToken);

      return res
        .status(HTTP_STATUS.OK)
        .json({ access_token: newAccessToken, role: userRole });
    } catch (err) {
      console.error("Refresh failed:", err);
      return res
        .status(HTTP_STATUS.FORBIDDEN)
        .json({ message: "Invalid refresh token" });
    }
  }
}
