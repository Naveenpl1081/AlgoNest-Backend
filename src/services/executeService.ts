import { injectable, inject } from "tsyringe";
import { IExecuteRepository } from "../interfaces/Irepositories/IexecuteRepository";
import { IProblemRepository } from "../interfaces/Irepositories/IproblemRepository";
import { dockerExecutor, ExecutionResult } from "../utils/dockerExecutor";
import { IExecuteService } from "../interfaces/Iserveices/IexecuteService";
import { IRun } from "../interfaces/models/Irun";


export interface ExecuteRunDTO {
  code: string;
  language: string;
  problemId: string;
  userId: string;
}

@injectable()
export class ExecuteService implements IExecuteService {
  constructor(
    @inject("IExecuteRepository") private _executeRepository: IExecuteRepository,
    @inject("IProblemRepository") private _problemRepository: IProblemRepository
  ) {}

  async executeRun(dto: ExecuteRunDTO): Promise<IRun> {
    const { code, language, problemId, userId } = dto;

    const problem = await this._problemRepository.findProblemById(problemId);
    if (!problem) throw new Error("Problem not found");

    const testCase = problem.testCases[0];
    const wrappedCode = this.wrapCode(code, language, testCase, problem.functionName);

    console.log("wrappedCode",wrappedCode)

    const executionResult: ExecutionResult = await dockerExecutor.runCode(
      wrappedCode,
      language,
      Number(problem.timeLimit),
      Number(problem.memoryLimit)
    );

    console.log("executionResult",executionResult)

    const run = await this._executeRepository.createRun({
      userId,
      problemId,
      language,
      code,
      testResult: executionResult,
    });

    return run;
  }

  private wrapCode(code: string, language: string, testCase: any, functionName: string): string {
    if (language === "javascript") {
      return `
${code}

const testCase = ${JSON.stringify(testCase)};
function runTest() {
  try {
    const result = ${functionName}(...testCase.input);
    if (JSON.stringify(result) === JSON.stringify(testCase.output)) {
      console.log("TEST PASSED");
    } else {
      console.log("TEST FAILED");
      console.log("Expected:", testCase.output);
      console.log("Got:", result);
    }
  } catch (error) {
    console.log("ERROR:", error.message);
  }
}
runTest();
      `;
    }
    throw new Error("Language not supported yet");
  }
}
