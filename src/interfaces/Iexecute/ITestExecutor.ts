import { ITestCase } from "../DTO/IServices/IExecuteService";
import { ITestResult } from "../DTO/IServices/IExecuteService";
export interface ITestExecutor {
    runSingleTest(
      code: string,
      language: string,
      testCase: ITestCase,
      functionName: string,
      timeLimit: number,
      memoryLimit: number,
      caseNumber: number
    ): Promise<ITestResult>;
  }
  

