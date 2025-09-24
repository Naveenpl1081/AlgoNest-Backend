
export interface ITestResultResponse {
    caseNumber: number;
    input: string;
    output: string;
    expected: string;
    passed: boolean;
    error?: string;
    executionTime?: number;
    memoryUsed?: number;
  }
  

  export interface IRunResponse {
    userId: string;
    problemId: string;
    language: string;
    code: string;
    testResults: ITestResultResponse[];
    overallStatus: "passed" | "failed" | "error";
    createdAt: Date;
  }
  