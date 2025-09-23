export interface ExecuteRunDTO {
    code: string;
    language: string;
    problemId: string;
    userId: string;
  }

  export interface ITestCase {
    input: string[];
    output: string;
  }

  export interface ITestResult {
    caseNumber: number;
    input: string;
    output: string;
    expected: string;
    passed: boolean;
    error?: string;
    executionTime?: number;
    memoryUsed?: number;
    consoleOutput?: string;
  }

  export interface ExecuteRunResponse {
    success: true;
    testResults: ITestResult[];
    overallStatus: "passed" | "failed";
    consoleOutput: string;
  }

  
  export interface ExecuteSubmitResponse {
    success: true;
    testResults: ITestResult[];
    overallStatus: "passed" | "failed";
    runId: string;
    consoleOutput: string;
    summary: {
      totalTests: number;
      passedTests: number;
      failedTests: number;
    };
  }
  
  