import jwt, { Secret, SignOptions } from "jsonwebtoken";
import {IJwtService} from "../interfaces/IJwt/Ijwt"

const JWT_SECRET=process.env.JWT_SECRET
const JWT_EXPIRES_IN=process.env.JWT_EXPIRES_IN
const JWT_REFRESH_EXPIRES_IN=process.env.JWT_REFRESH_EXPIRES_IN
const JWT_REFRESH_SECRET=process.env.JWT_REFRESH_SECRET


export class JWTService implements IJwtService {
    generateAccessToken(Id: string, role: string): string {
      try {
        const options: SignOptions = {
          expiresIn: JWT_EXPIRES_IN as unknown as number,
        };
        return jwt.sign({ Id, role },JWT_SECRET as Secret, options);
      } catch (error) {
        console.log("error:", error);
        throw new Error("Error generating access token");
      }
    }
    generateRefreshToken(id: string,role:string): string {
        const options: SignOptions = {
          expiresIn:JWT_REFRESH_EXPIRES_IN as unknown as number,
        };
        return jwt.sign({ id,role }, JWT_REFRESH_SECRET as Secret, options);
      }
    
      verifyAccessToken(token: string) {
        return jwt.verify(token, process.env.JWT_SECRET as string);
      }
      
      verifyRefreshToken(token: string) {
        return jwt.verify(token, process.env.JWT_REFRESH_SECRET as string);
      }
}