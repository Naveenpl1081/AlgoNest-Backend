import { injectable } from "tsyringe";
import { IExecuteRepository } from "../interfaces/Irepositories/IexecuteRepository";
import { IRun } from "../interfaces/models/Irun";
import { ExecutionModel } from "../models/executionSchema";


interface CreateRunDTO {
  userId: string;
  problemId: string;
  language: string;
  code: string;
  testResult: any;
}

@injectable()
export class ExecuteRepository implements IExecuteRepository {
  async createRun(data: CreateRunDTO): Promise<IRun> {
    const run = new ExecutionModel({
      userId: data.userId,
      problemId: data.problemId,
      language: data.language,
      code: data.code,
      testResult: data.testResult,
      createdAt: new Date(),
    });
    return run.save();
  }
}
