import { Request, Response, NextFunction } from "express";
import { injectable, inject } from "tsyringe";
import { Roles } from "../config/roles";
import { IJwtService } from "../interfaces/IJwt/Ijwt";
import { HTTP_STATUS } from "../utils/httpStatus";
import { IUserRepository } from "../interfaces/Irepositories/IuserRepository";
import { IRecruiterRepository } from "../interfaces/Irepositories/IrecruiterRepository";

interface JwtPayload {
  id: string;
  role: Roles;
}

export interface AuthenticatedRequest extends Request {
  user?: JwtPayload;
}

@injectable()
export class AuthMiddleware {
  constructor(
    @inject("IJwtService") private _jwtService: IJwtService,
    @inject("IUserRepository") private _userRepository: IUserRepository,
    @inject("IRecruiterRepository")
    private _recruiterRepository: IRecruiterRepository
  ) {}

  private getToken(req: Request): string | null {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return null;
    }
    return authHeader.split(" ")[1];
  }

  authenticate(requiredRole: Roles) {
    return async (
      req: AuthenticatedRequest,
      res: Response,
      next: NextFunction
    ) => {
      try {
        const token = this.getToken(req);
        console.log("token", token);
        if (!token) {
          return res
            .status(HTTP_STATUS.UNAUTHORIZED)
            .json({ message: "Token not provided" });
        }

        console.log("requiredRole", requiredRole);

        const payload = (await this._jwtService.verifyAccessToken(
          token
        )) as JwtPayload;
        console.log("payload", payload);

        if (requiredRole == Roles.USER) {
          const user = await this._userRepository.findUserById(payload.id);
          console.log("user", user);
          if (!user) {
            return res
              .status(HTTP_STATUS.NOT_FOUND)
              .json({ message: "user not found" });
          }
          if (user.status === "InActive") {
            res.clearCookie("refresh_token", {
              httpOnly: true,
              secure: true,
              sameSite: "strict",
            });
            return res
              .status(HTTP_STATUS.FORBIDDEN)
              .json({ message: "user blocked by admin" });
          }
        } else {
          const recruiter = await this._recruiterRepository.findById(
            payload.id
          );
          console.log("recruiter", recruiter);

          if (!recruiter) {
            return res.status(HTTP_STATUS.UNAUTHORIZED).json({
              message: "Recruiter not found",
            });
          }

          if (recruiter.status === "InActive") {
            res.clearCookie("refresh_token", {
              httpOnly: true,
              secure: true,
              sameSite: "strict",
            });
            return res
              .status(HTTP_STATUS.FORBIDDEN)
              .json({ message: "User blocked by admin" });
          }
        }

        if (!payload || payload.role !== requiredRole) {
          console.log("erorr got it");
          return res
            .status(HTTP_STATUS.FORBIDDEN)
            .json({ message: "Invalid role to perform this action" });
        }

        req.user = payload;

        next();
      } catch (error) {
        console.error("Auth error:", error);
        return res
          .status(HTTP_STATUS.UNAUTHORIZED)
          .json({ message: "Unauthorized or invalid token" });
      }
    };
  }
}
