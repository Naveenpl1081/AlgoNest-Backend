import { ITestCase } from "../DTO/IServices/IExecuteService";

export interface ICodeWrapper {
    wrapCodeForTest(
      code: string,
      language: string,
      testCase: ITestCase,
      functionName: string
    ): string;
  }