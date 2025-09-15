import { IRun } from "../models/Irun";

export interface IExecuteRepository {
    createRun(data: {
      userId: string;
      problemId: string;
      language: string;
      code: string;
      testResult: any;
    }): Promise<IRun>; 
  }
  