export interface IRun {
    userId: string;
    problemId: string;
    language: string;
    code: string;
    testResult: {
      output?: string;         // Actual output from running the code
      error?: string;          // Any runtime or compilation error
      status: 'passed' | 'failed' | 'error'; // Overall test status
      executionTime?: number;  // Time taken in ms (optional)
      memoryUsed?: number;    // Memory used in MB (optional)
    };
    createdAt: Date;
  }
  