import { RunDocument } from "../../models/executionSchema";
import { CreateRunDTO } from "../models/IExecute";



export interface IExecuteRepository {
  createRun(data: CreateRunDTO): Promise<RunDocument>
  findRunsByProblemIdAndUserId(userId:string,problemId:string):Promise<RunDocument[]>
  }
  