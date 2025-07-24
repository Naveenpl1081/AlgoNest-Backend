import { Request, Response } from "express";
import { IUserService } from "../interfaces/Iserveices/IuserService";
import { IUserController } from "../interfaces/Icontrollers/IuserController";
import { injectable, inject } from "tsyringe";

@injectable()
export class UserController implements IUserController {
  constructor(@inject("IUserService") private _userService: IUserService) {}

  async register(req: Request, res: Response): Promise<void> {
    try {
      console.log("entering the register function in the user controller");
      const data = req.body;
      console.log("data", data);
      const serviceResponse = await this._userService.userSignUp(data);
      console.log("serviceResponse in the register function", serviceResponse);
      if (serviceResponse.success) {
        res.status(201).json(serviceResponse);
      } else {
        res.status(409).json({ message: serviceResponse.message });
      }
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }

  async verifyOtp(req: Request, res: Response): Promise<void> {
    try {
      console.log("reached verifyotp");
      const { otp } = req.body;
      console.log("otp", otp);
      const response = await this._userService.verifyOtp(otp);
      console.log("response", response);
      if (response.success) {
        res.status(200).json(response);
      } else {
        res.status(400).json(response);
      }
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  }
}
