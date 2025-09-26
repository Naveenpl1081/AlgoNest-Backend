

import { ExecuteRunDTO, ExecuteRunResponse, ExecuteSubmitResponse } from "../DTO/IServices/IExecuteService";
import { IRunResponse } from "../DTO/IServices/ISubmissionService";
import { IUserStats } from "../DTO/IServices/IUserServise";


export interface IExecuteService {
    executeRun(dto: ExecuteRunDTO): Promise<ExecuteRunResponse>
    executeSubmit(dto: ExecuteRunDTO): Promise<ExecuteSubmitResponse>
    allSubmissionService(
      userId: string,
      problemId: string
    ): Promise<IRunResponse[] | null>
    getUserStats(userId: string):Promise<IUserStats>
}
