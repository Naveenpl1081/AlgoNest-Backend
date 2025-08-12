import { Request, Response, NextFunction } from "express";
import { injectable, inject } from "tsyringe";
import { Roles } from "../config/roles";
import { IJwtService } from "../interfaces/IJwt/Ijwt";
import { HTTP_STATUS } from "../utils/httpStatus";

interface JwtPayload {
  id: string;
  role: Roles;
}

interface AuthenticatedRequest extends Request {
  user?: JwtPayload;
}

@injectable()
export class AuthMiddleware {
  constructor(
    @inject("IJwtService") private jwtService: IJwtService
  ) {}

  private getToken(req: Request): string | null {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return null;
    }
    return authHeader.split(" ")[1];
  }

  authenticate(requiredRole: Roles) {
    return async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
      try {
        const token = this.getToken(req);
        if (!token) {
          return res.status(HTTP_STATUS.UNAUTHORIZED).json({ message: "Token not provided" });
        }

        const payload = await this.jwtService.verifyAccessToken(token) as JwtPayload;

        if (!payload || payload.role !== requiredRole) {
          console.log("erorr got it")
          return res.status(HTTP_STATUS.FORBIDDEN).json({ message: "Invalid role to perform this action" });
        }

        req.user = payload;

        next();
      } catch (error) {
        console.error("Auth error:", error);
        return res.status(HTTP_STATUS.UNAUTHORIZED).json({ message: "Unauthorized or invalid token" });
      }
    };
  }
}
