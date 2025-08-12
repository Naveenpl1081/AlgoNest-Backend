import {Request,Response} from "express"
export interface IAdminController{
    login(req: Request, res: Response): Promise<void>;
    getAllUsers(req: Request, res: Response): Promise<void>;
}