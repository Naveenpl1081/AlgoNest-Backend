import { injectable } from "tsyringe";
import { IExecuteRepository } from "../interfaces/Irepositories/IexecuteRepository";
import { CreateRunDTO } from "../interfaces/models/IExecute";
import { ExecutionModel } from "../models/executionSchema";
import { RunDocument } from "../models/executionSchema";
import { BaseRepository } from "./baseRepository";

@injectable()
export class ExecuteRepository
  extends BaseRepository<RunDocument>
  implements IExecuteRepository
{
  constructor() {
    super(ExecutionModel);
  }

  async createRun(data: CreateRunDTO): Promise<RunDocument> {
    const runData = {
      ...data,
      createdAt: new Date(),
    };
    return await this.create(runData);
  }

  async findRunsByProblemIdAndUserId(
    userId: string,
    problemId: string
  ): Promise<RunDocument[]> {

    const result = (await this.find(
      { userId, problemId },
      {
        sort: { createdAt: -1 },
      }
    )) as RunDocument[];
    return result;
  }
}
