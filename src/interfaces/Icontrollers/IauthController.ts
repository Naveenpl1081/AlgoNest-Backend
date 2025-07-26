import { Request, Response } from "express";

export interface IAuthController {
  refreshTokenHandler(req: Request, res: Response): Promise<Response>;
}
