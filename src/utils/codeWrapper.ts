import { inject, injectable } from "tsyringe";
import { ITestCase } from "../interfaces/DTO/IServices/IExecuteService";
import { ICodeWrapper } from "../interfaces/Iexecute/ICodeWrapper";
import { IOutputParser } from "../interfaces/Iexecute/IOutputPareser";

@injectable()
export class CodeWrapper implements ICodeWrapper {
  constructor(@inject("IOutputParser") private _outputParser: IOutputParser) {}

  wrapCodeForTest(
    code: string,
    language: string,
    testCase: ITestCase,
    functionName: string
  ): string {
    if (language === "javascript") {
      return this.wrapJavaScriptCode(code, testCase, functionName);
    }

    if (language === "python") {
      return this.wrapPythonCode(code, testCase, functionName);
    }

    throw new Error(`Language ${language} not supported yet`);
  }

  private wrapJavaScriptCode(
    code: string,
    testCase: ITestCase,
    functionName: string
  ): string {
    return `
// Store original console.log
const originalConsoleLog = console.log;
let consoleOutput = [];

// Override console.log to capture output
console.log = function(...args) {
  consoleOutput.push(args.map(arg => 
    typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
  ).join(' '));
};

${code}

// Test execution
try {
  const testInputs = ${this._outputParser.parseInputArray(testCase.input)};
  const expectedOutput = ${this._outputParser.parseOutput(testCase.output)};

  const result = ${functionName}(...testInputs);
  originalConsoleLog("RESULT:" + JSON.stringify(result));
  
  if (JSON.stringify(result) === JSON.stringify(expectedOutput)) {
    originalConsoleLog("TEST_PASSED");
  }
  
  // Output captured console logs with proper formatting
  if (consoleOutput.length > 0) {
    consoleOutput.forEach(log => originalConsoleLog("CONSOLE:" + log));
  }
} catch (error) {
  originalConsoleLog("ERROR:" + error.message);
  // Output captured console logs even on error
  if (consoleOutput.length > 0) {
    consoleOutput.forEach(log => originalConsoleLog("CONSOLE:" + log));
  }
}
    `;
  }

  private wrapPythonCode(
    code: string,
    testCase: ITestCase,
    functionName: string
  ): string {
    const cleanedCode = this._outputParser.cleanCodeForPython(code);

    const pythonInputs = this._outputParser.parsePythonInputs(testCase.input);
    const pythonExpectedOutput = this._outputParser.parsePythonOutput(testCase.output);

    return `
import json
import sys
from io import StringIO

# Capture print statements
captured_output = StringIO()
original_stdout = sys.stdout
sys.stdout = captured_output

${cleanedCode}

# Test execution
try:
    test_inputs = ${pythonInputs}
    expected_output = ${pythonExpectedOutput}
    result = ${functionName}(*test_inputs)
    
    # Restore stdout and capture console output
    sys.stdout = original_stdout
    console_logs = captured_output.getvalue()
    
    print("RESULT:" + json.dumps(result))
    
    if result == expected_output:
        print("TEST_PASSED")
    
    # Output captured console logs with proper formatting
    if console_logs.strip():
        for line in console_logs.strip().split('\\n'):
            if line.strip():
                print("CONSOLE:" + line)
                
except Exception as error:
    sys.stdout = original_stdout
    console_logs = captured_output.getvalue()
    print("ERROR:" + str(error))
    
    # Output captured console logs even on error
    if console_logs.strip():
        for line in console_logs.strip().split('\\n'):
            if line.strip():
                print("CONSOLE:" + line)
`;
  }
}
