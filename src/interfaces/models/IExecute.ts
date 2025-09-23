export interface CreateRunDTO {
    userId: string;
    problemId: string;
    language: string;
    code: string;
    testResults: Array<{
      caseNumber: number;
      input: string;
      output: string;
      expected: string;
      passed: boolean;
      error?: string;
      executionTime?: number;
      memoryUsed?: number;
    }>;
    overallStatus: "passed" | "failed" | "error";
  }