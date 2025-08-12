
import { Request, Response } from "express";

export interface IRecuiterController{
    register(req:Request,res:Response):Promise <void>;
}