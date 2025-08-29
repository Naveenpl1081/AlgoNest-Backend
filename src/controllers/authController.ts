import { Request, Response } from "express";
import { injectable, inject } from "tsyringe";
import { JWTService } from "../utils/jwt";
import { HTTP_STATUS } from "../utils/httpStatus";

@injectable()
export class AuthController {
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

      const payload = this.jwtService.verifyRefreshToken(token);
      console.log("payload", payload);

      if (!payload) {
        return res
          .status(HTTP_STATUS.FORBIDDEN)
          .json({ message: "Invalid refresh token" });
      }

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
