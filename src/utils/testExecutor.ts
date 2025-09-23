import { inject, injectable } from "tsyringe";
import { ITestCase, ITestResult } from "../interfaces/DTO/IServices/IExecuteService";
import { ICodeWrapper } from "../interfaces/Iexecute/ICodeWrapper";
import { IOutputParser } from "../interfaces/Iexecute/IOutputPareser";
import { ITestExecutor } from "../interfaces/Iexecute/ITestExecutor";
import { dockerExecutor, ExecutionResult } from "./dockerExecutor";

@injectable()
export class TestExecutor implements ITestExecutor {
  constructor(
    @inject("ICodeWrapper") private _codeWrapper: ICodeWrapper,
    @inject("IOutputParser") private _outputParser: IOutputParser
  ) {}


  private dockerExecutor = dockerExecutor;

  async runSingleTest(
    code: string,
    language: string,
    testCase: ITestCase,
    functionName: string,
    timeLimit: number,
    memoryLimit: number,
    caseNumber: number
  ): Promise<ITestResult> {
    try {
      const wrappedCode = this._codeWrapper.wrapCodeForTest(
        code,
        language,
        testCase,
        functionName
      );

      console.log("wrapcode",wrappedCode)

      console.log(`Running test case ${caseNumber}...`);

      const executionResult: ExecutionResult = await this.dockerExecutor.runCode(
        wrappedCode,
        language,
        timeLimit,
        memoryLimit
      );

      console.log("executionResulr",executionResult)

      console.log(`Test case ${caseNumber} result:`, executionResult.status);

      if (executionResult.status === "timeout") {
        return this.createTimeoutResult(testCase, executionResult, caseNumber);
      }

      if (executionResult.status === "error") {
        return this.createErrorResult(testCase, executionResult, caseNumber);
      }

      return this.createSuccessResult(testCase, executionResult, caseNumber);
    } catch (error) {
      return this.createExceptionResult(testCase, error, caseNumber);
    }
  }

  private createTimeoutResult(testCase: ITestCase, executionResult: ExecutionResult, caseNumber: number) {
    return {
      caseNumber,
      input: Array.isArray(testCase.input)
        ? JSON.stringify(testCase.input)
        : testCase.input,
      output: "Time Limit Exceeded",
      expected: testCase.output,
      passed: false,
      error:
        executionResult.error ||
        "Your code took too long to execute. Check for infinite loops.",
      executionTime: executionResult.executionTime,
      consoleOutput: executionResult.consoleOutput || "",
    };
  }

  private createErrorResult(testCase: ITestCase, executionResult: ExecutionResult, caseNumber: number) {
    return {
      caseNumber,
      input: Array.isArray(testCase.input)
        ? JSON.stringify(testCase.input)
        : testCase.input,
      output: executionResult.error || "Execution failed",
      expected: testCase.output,
      passed: false,
      error: executionResult.error,
      executionTime: executionResult.executionTime,
      consoleOutput: executionResult.consoleOutput || "",
    };
  }

  private createSuccessResult(testCase: ITestCase, executionResult: ExecutionResult, caseNumber: number) {
    const parsedResult = this._outputParser.parseExecutionOutput(
      executionResult.output || ""
    );

    return {
      caseNumber,
      input: Array.isArray(testCase.input)
        ? JSON.stringify(testCase.input)
        : testCase.input,
      output: parsedResult.actualOutput || "No Output",
      expected: testCase.output,
      passed: parsedResult.passed,
      error: parsedResult.error,
      executionTime: executionResult.executionTime,
      consoleOutput: executionResult.consoleOutput || "",
    };
  }

  private createExceptionResult(testCase: ITestCase, error: unknown, caseNumber: number) {
    return {
      caseNumber,
      input: Array.isArray(testCase.input)
        ? JSON.stringify(testCase.input)
        : testCase.input,
      output:
        "Execution Error: " +
        (error instanceof Error ? error.message : "Unknown error"),
      expected: testCase.output,
      passed: false,
      error: error instanceof Error ? error.message : "Execution failed",
      executionTime: 0,
      consoleOutput: "",
    };
  }
}