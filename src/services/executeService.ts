import { injectable, inject } from "tsyringe";
import { IExecuteRepository } from "../interfaces/Irepositories/IexecuteRepository";
import { IProblemRepository } from "../interfaces/Irepositories/IproblemRepository";
import { IExecuteService } from "../interfaces/Iserveices/IexecuteService";
import { RunDocument } from "../models/executionSchema";
import {
  ExecuteRunDTO,
  ExecuteRunResponse,
  ExecuteSubmitResponse,
} from "../interfaces/DTO/IServices/IExecuteService";
import { ITestExecutor } from "../interfaces/Iexecute/ITestExecutor";
import { IRunResponse } from "../interfaces/DTO/IServices/ISubmissionService";

@injectable()
export class ExecuteService implements IExecuteService {
  constructor(
    @inject("IExecuteRepository")
    private _executeRepository: IExecuteRepository,
    @inject("IProblemRepository")
    private _problemRepository: IProblemRepository,
    @inject("ITestExecutor") private _testExecutor: ITestExecutor
  ) {}

  async executeSubmit(dto: ExecuteRunDTO): Promise<ExecuteSubmitResponse> {
    const { code, language, problemId, userId } = dto;

    try {
      const problem = await this._problemRepository.findProblemById(problemId);
      if (!problem) {
        throw new Error("Problem not found");
      }

      if (!problem.testCases || problem.testCases.length === 0) {
        throw new Error("No test cases available");
      }

      const testResults = [];
      let overallConsoleOutput = "";

      for (let i = 0; i < problem.testCases.length; i++) {
        const testCase = problem.testCases[i];
        console.log("testcases", testCase);
        const result = await this._testExecutor.runSingleTest(
          code,
          language,
          testCase,
          problem.functionName,
          Number(problem.timeLimit),
          Number(problem.memoryLimit),
          i + 1
        );

        testResults.push(result);

        if (result.consoleOutput && result.consoleOutput.trim()) {
          if (overallConsoleOutput) {
            overallConsoleOutput += "\n\n" + result.consoleOutput;
          } else {
            overallConsoleOutput = result.consoleOutput;
          }
        }
      }

      const passedTests = testResults.filter((result) => result.passed).length;
      const totalTests = testResults.length;
      const overallStatus = passedTests === totalTests ? "passed" : "failed";

      const run = await this._executeRepository.createRun({
        userId,
        problemId,
        language,
        code,
        testResults,
        overallStatus,
      });

      return {
        success: true,
        testResults,
        overallStatus,
        runId: run._id?.toString() || "unknown",
        consoleOutput: overallConsoleOutput,
        summary: {
          totalTests,
          passedTests,
          failedTests: totalTests - passedTests,
        },
      };
    } catch (error) {
      console.error("Execution error:", error);

      try {
        await this._executeRepository.createRun({
          userId,
          problemId,
          language,
          code,
          testResults: [
            {
              caseNumber: 1,
              input: "N/A",
              output:
                "System Error: " +
                (error instanceof Error ? error.message : "Unknown error"),
              expected: "N/A",
              passed: false,
              error: error instanceof Error ? error.message : "Unknown error",
            },
          ],
          overallStatus: "error",
        });
      } catch (saveError) {
        console.error("Failed to save error run:", saveError);
      }

      throw error;
    }
  }

  async executeRun(dto: ExecuteRunDTO): Promise<ExecuteRunResponse> {
    const { code, language, problemId, userId } = dto;
    try {
      const problem = await this._problemRepository.findProblemById(problemId);
      if (!problem) {
        throw new Error("Problem not found");
      }

      const testCase = problem.testCases[0];
      if (!testCase) {
        throw new Error("No test cases available");
      }

      const result = await this._testExecutor.runSingleTest(
        code,
        language,
        testCase,
        problem.functionName,
        Number(problem.timeLimit),
        Number(problem.memoryLimit),
        1
      );

      return {
        success: true,
        testResults: [result],
        overallStatus: result.passed ? "passed" : "failed",
        consoleOutput: result.consoleOutput || "",
      };
    } catch (error) {
      console.error("Execution error:", error);

      try {
        await this._executeRepository.createRun({
          userId,
          problemId,
          language,
          code,
          testResults: [
            {
              caseNumber: 1,
              input: "N/A",
              output:
                "System Error: " +
                (error instanceof Error ? error.message : "Unknown error"),
              expected: "N/A",
              passed: false,
              error: error instanceof Error ? error.message : "Unknown error",
            },
          ],
          overallStatus: "error",
        });
      } catch (saveError) {
        console.error("Failed to save error run:", saveError);
      }

      throw error;
    }
  }

  async allSubmissionService(
    userId: string,
    problemId: string
  ): Promise<IRunResponse[] | null> {
    try {
      const data = await this._executeRepository.findRunsByProblemIdAndUserId(
        userId,
        problemId
      );
      if (!data || data.length === 0) {
        return null;
      }
      const mappedData: IRunResponse[] = data.map((run) => ({
        userId: run.userId,
        problemId: run.problemId,
        language: run.language,
        code: run.code,
        testResults: run.testResults.map((test) => ({
          caseNumber: test.caseNumber,
          input: test.input,
          output: test.output,
          expected: test.expected,
          passed: test.passed,
          error: test.error,
          executionTime: test.executionTime,
          memoryUsed: test.memoryUsed,
        })),
        overallStatus: run.overallStatus,
        createdAt: run.createdAt,
      }));

      return mappedData;
    } catch (error) {
      console.error("Error in allSubmissionService:", error);
      throw error;
    }
  }
}
