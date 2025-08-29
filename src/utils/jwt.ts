import jwt, { Secret, SignOptions } from "jsonwebtoken";
import { IJwtService } from "../interfaces/IJwt/Ijwt";
import { ITokenPayload } from "../interfaces/IJwt/Ijwt";
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN;
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;

export class JWTService implements IJwtService {
  generateAccessToken(id: string, role: string): string {
    try {
      const options: SignOptions = {
        expiresIn: JWT_EXPIRES_IN as unknown as number,
      };
      return jwt.sign({ id, role }, JWT_SECRET as Secret, options);
    } catch (error) {
      console.log("error:", error);
      throw new Error("Error generating access token");
    }
  }
  generateRefreshToken(id: string, role: string): string {
    const options: SignOptions = {
      expiresIn: JWT_REFRESH_EXPIRES_IN as unknown as number,
    };
    return jwt.sign({ id, role }, JWT_REFRESH_SECRET as Secret, options);
  }

  verifyAccessToken(token: string):ITokenPayload |null{
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET as string);

      if (typeof decoded === "string") {
        return null; 
      }

      
      return decoded as ITokenPayload;
    } catch (err) {
      console.error("Invalid access token", err);
      return null;
    }
  }

  verifyRefreshToken(token: string):ITokenPayload |null {
    try {
      const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET as string);

      if (typeof decoded === "string") {
        return null;
      }

      console.log("decode",decoded)

      return decoded as ITokenPayload;
    } catch (err) {
      console.error("Invalid refresh token", err);
      return null;
    }
  }
}
