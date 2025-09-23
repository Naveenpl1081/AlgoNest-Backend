import { injectable } from "tsyringe";
import { IOutputParser } from "../interfaces/Iexecute/IOutputPareser";

@injectable()
export class OutputParser implements IOutputParser {
  parseInputArray(inputArray: string[]): string {
    const parsedParams = inputArray.map((param) => {
      try {
        return JSON.parse(param);
      } catch {
        const num = Number(param);
        if (!isNaN(num)) {
          return num;
        }
        return param;
      }
    });

    return JSON.stringify(parsedParams);
  }

  parseOutput(output: string): string {
    try {
      const parsed = JSON.parse(output);
      return JSON.stringify(parsed);
    } catch {
      const num = Number(output);
      if (!isNaN(num)) {
        return JSON.stringify(num);
      }
      return JSON.stringify(output);
    }
  }

  parseExecutionOutput(stdout: string): {
    actualOutput: string;
    passed: boolean;
    error?: string;
  } {
    if (!stdout) return { actualOutput: "", passed: false };

    const lines = stdout.split("\n").filter((line) => line.trim());

    let actualOutput = "";
    let passed = false;
    let error = undefined;

    for (const line of lines) {
      if (line.startsWith("RESULT:")) {
        actualOutput = line.replace("RESULT:", "").trim();
      } else if (line === "TEST_PASSED") {
        passed = true;
      } else if (line.startsWith("ERROR:")) {
        error = line.replace("ERROR:", "").trim();
      }
    }

    return {
      actualOutput,
      passed,
      error,
    };
  }

  parsePythonInputs(input: string[]): string {
    try {
      if (Array.isArray(input)) {
        const pythonArray = input.map((item) => this.parseInputItem(item));
        return JSON.stringify(pythonArray);
      }

      if (typeof input === "string") {
        try {
          const parsed = JSON.parse(input);
          if (Array.isArray(parsed)) {
            const pythonArray = parsed.map((item) => this.parseInputItem(item));
            return JSON.stringify(pythonArray);
          }
        } catch {
          return JSON.stringify([input]);
        }
      }

      return JSON.stringify([input]);
    } catch (error) {
      console.error("Error parsing Python inputs:", error);
      return JSON.stringify([input]);
    }
  }

  private parseInputItem(item: string): any {
    if (typeof item !== "string") {
      return item;
    }

    let cleanItem = item;
    if (item.startsWith('"') && item.endsWith('"')) {
      cleanItem = item.slice(1, -1);
    }
    if (cleanItem.startsWith('\\"') && cleanItem.endsWith('\\"')) {
      cleanItem = cleanItem.slice(2, -2);
    }

    try {
      const parsed = JSON.parse(cleanItem);
      return parsed;
    } catch {
      const numValue = Number(cleanItem);
      if (!isNaN(numValue) && isFinite(numValue)) {
        return numValue;
      }

      if (cleanItem.toLowerCase() === "true") return true;
      if (cleanItem.toLowerCase() === "false") return false;

      if (cleanItem.toLowerCase() === "null") return null;

      return cleanItem;
    }
  }


  parsePythonOutput(output: string): string {
    try {
      if (typeof output === "string") {
        let cleanOutput = output;
        if (output.startsWith('"') && output.endsWith('"')) {
          cleanOutput = output.slice(1, -1);

          if (cleanOutput.startsWith('\\"') && cleanOutput.endsWith('\\"')) {
            cleanOutput = cleanOutput.slice(2, -2);
          }
        }

        try {
          const parsed = JSON.parse(cleanOutput);
          return JSON.stringify(parsed);
        } catch {
          return JSON.stringify(cleanOutput);
        }
      }

      return JSON.stringify(output);
    } catch (error) {
      console.error("Error parsing Python output:", error);
      return JSON.stringify(output);
    }
  }

  cleanCodeForPython(code: string): string {
    const cleanedCode = code

      .replace(/\/\/.*$/gm, "")

      .replace(/\/\*[\s\S]*?\*\//g, "")

      .replace(/\/\*\*[\s\S]*?\*\//g, "")

      .replace(/^\s*[\r\n]/gm, "")

      .trim();

    return cleanedCode;
  }
}