// middlewares/AuthMiddleware.ts
import { Request, Response, NextFunction } from "express";
import { injectable, inject } from "tsyringe";
import { IJwtService } from "../interfaces/IJwt/Ijwt";

@injectable()
export class AuthMiddleware {
  constructor(
    @inject("IJwtService") private jwtService: IJwtService
  ) {}

  handler = (req: Request, res: Response, next: NextFunction): Response | void => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Unauthorized: No token provided" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = this.jwtService.verifyAccessToken(token);

    if (!decoded) {
      return res.status(401).json({ message: "Unauthorized: Invalid token" });
    }

    (req as any).user = decoded;
    next();
  };
}
