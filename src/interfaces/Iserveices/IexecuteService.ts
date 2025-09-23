
import { RunDocument } from "../../models/executionSchema";
import { ExecuteRunDTO, ExecuteRunResponse, ExecuteSubmitResponse } from "../DTO/IServices/IExecuteService";


export interface IExecuteService {
    executeRun(dto: ExecuteRunDTO): Promise<ExecuteRunResponse>
    executeSubmit(dto: ExecuteRunDTO): Promise<ExecuteSubmitResponse>
    allSubmissionService(
        userId: string,
        problemId: string
      ): Promise<RunDocument[] | null> 
}
