import { Request, Response } from "express";

export interface IUserController {
  register(req: Request, res: Response): Promise<void>;
  login(req: Request, res: Response): Promise<void>;
  verifyOtp(req: Request, res: Response): Promise<void>;
  profile(req:Request,res:Response):Promise<void>;
  updateProfile(req: Request, res: Response): Promise<void> 
}
