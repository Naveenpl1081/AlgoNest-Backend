export interface IOutputParser {
    parseInputArray(inputArray: string[]): string;
    parseOutput(output: string): string;
    parseExecutionOutput(stdout: string): {
      actualOutput: string;
      passed: boolean;
      error?: string;
    };
    parsePythonInputs(input: string[]): string
    parsePythonOutput(output: string): string
    cleanCodeForPython(code: string): string 
  }