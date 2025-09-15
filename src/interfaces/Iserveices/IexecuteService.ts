
import { ExecuteRunDTO } from "../../services/executeService";
import { IRun } from "../models/Irun";

export interface IExecuteService {
    executeRun({ code, language, problemId, userId }: ExecuteRunDTO): Promise<IRun>
}
