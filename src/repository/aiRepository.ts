import { IAIRepository } from "../interfaces/Irepositories/IaiRepository";
import axios from "axios";

interface CustomError extends Error {
  type: string;
  retryAfter?: number;
}

export class AIRepository implements IAIRepository {
  private groqApiKey: string;

  constructor() {
    this.groqApiKey = process.env.GROQ_API_KEY || "";

    if (!this.groqApiKey) {
      console.warn(
        "⚠️ GROQ_API_KEY not found. AI debugging will use fallback methods."
      );
    }
  }

  async getAIExplanation({
    code,
    errorLog,
    problemStatement,
  }: {
    code: string;
    errorLog: string;
    problemStatement: string;
  }): Promise<{
    explanation: string;
    suggestedFix: string;
    codeExample?: string;
    confidence: number;
  }> {
    if (this.groqApiKey) {
      try {
        return await this.getAdvancedGroqExplanation(
          code,
          errorLog,
          problemStatement
        );
      } catch (error: any) {
        console.error("Groq API failed:", error.message);

        if (error.response?.status === 429) {
          const customError = new Error(
            "Groq API rate limit exceeded"
          ) as CustomError;
          customError.type = "RATE_LIMITED";
          customError.retryAfter = 60;
          throw customError;
        }
      }
    }

    return this.getEnhancedRuleBasedAnalysis(code, errorLog, problemStatement);
  }

  private async getAdvancedGroqExplanation(
    code: string,
    errorLog: string,
    problemStatement: string
  ): Promise<{
    explanation: string;
    suggestedFix: string;
    codeExample?: string;
    confidence: number;
  }> {
    const models = [
      "llama-3.3-70b-versatile",
      "llama-3.1-8b-instant",
      "gemma2-9b-it",
    ];

    const prompt = `You are an expert code debugger. Analyze this code and provide clear debugging help.

**Problem:** ${problemStatement}

**Student's Code:**
\`\`\`
${code}
\`\`\`

**Error:** ${errorLog}

Please explain what's wrong and how to fix it with clear examples.`;

    for (const model of models) {
      try {
        console.log(` Trying Groq model: ${model}`);
        const groqApi = process.env.GROQ_API;
        if (!groqApi) {
          return {
            explanation: "",
            suggestedFix:
              "Review the explanation above and apply the suggested changes.",
            confidence: 80,
          };
        }
        const response = await axios.post(
          groqApi,
          {
            messages: [{ role: "user", content: prompt }],
            model: model,
            max_tokens: 1000,
            temperature: 0.3,
          },
          {
            headers: {
              Authorization: `Bearer ${this.groqApiKey}`,
              "Content-Type": "application/json",
            },
            timeout: 20000,
          }
        );

        const aiResponse = response.data?.choices?.[0]?.message?.content;
        if (!aiResponse) {
          throw new Error("Empty response from Groq");
        }

        console.log(` Success with model: ${model}`);

        const sections = aiResponse
          .split("\n\n")
          .filter((s: string) => s.trim());

        return {
          explanation: sections[0] || aiResponse.substring(0, 400),
          suggestedFix:
            sections[1] ||
            "Apply the changes mentioned in the explanation above.",
          codeExample: this.extractCodeFromResponse(aiResponse),
          confidence: model.includes("70b")
            ? 95
            : model.includes("8b")
            ? 85
            : 75,
        };
      } catch (error: any) {
        console.error(
          ` Model ${model} failed:`,
          error.response?.data?.error?.message || error.message
        );

        if (model === models[models.length - 1]) {
          throw error;
        }

        continue;
      }
    }

    throw new Error("All Groq models failed");
  }

  private extractCodeFromResponse(response: string): string | undefined {
    const codeMatch = response.match(/```[\s\S]*?```/);
    if (codeMatch) {
      return codeMatch[0].replace(/```\w*\n?|\n?```/g, "").trim();
    }
    return undefined;
  }

  private getEnhancedRuleBasedAnalysis(
    code: string,
    errorLog: string,
    problemStatement: string
  ): {
    explanation: string;
    suggestedFix: string;
    codeExample?: string;
    confidence: number;
  } {
    const errorLower = errorLog.toLowerCase();
    const codeLower = code.toLowerCase();

    if (errorLower.includes("syntaxerror")) {
      return {
        explanation:
          "You have a syntax error in your code. This means the code structure doesn't follow JavaScript's grammar rules. Common causes include missing brackets, semicolons, or mismatched quotes.",
        suggestedFix:
          "1. Check for missing closing brackets ) ] }\n2. Ensure all strings have matching quotes\n3. Add missing semicolons\n4. Check for typos in keywords",
        codeExample:
          "// Example of common syntax fixes:\n// Missing bracket fix:\nif (condition) {\n  // code here\n} // ← Don't forget closing bracket",
        confidence: 90,
      };
    }

    if (
      errorLower.includes("referenceerror") ||
      errorLower.includes("is not defined")
    ) {
      const variableMatch = errorLog.match(/(\w+) is not defined/);
      const variable = variableMatch ? variableMatch[1] : "variable";

      return {
        explanation: `You're trying to use '${variable}' but it hasn't been declared yet. Variables must be declared before you can use them in JavaScript.`,
        suggestedFix: `1. Declare '${variable}' before using it\n2. Check spelling - make sure it matches exactly\n3. Ensure the variable is in the correct scope\n4. If it's a function, make sure it's defined`,
        codeExample: `// Fix example:\nlet ${variable} = someValue; // ← Declare first\nconsole.log(${variable}); // ← Then use`,
        confidence: 95,
      };
    }

    if (errorLower.includes("typeerror")) {
      return {
        explanation:
          "You're trying to perform an operation on a value that doesn't support it. This often happens when trying to call methods on null/undefined values or using the wrong data type.",
        suggestedFix:
          "1. Check if variables are null or undefined before using them\n2. Verify the data type matches what you expect\n3. Use typeof to check variable types\n4. Add defensive programming checks",
        codeExample:
          "// Safe access pattern:\nif (myArray && Array.isArray(myArray)) {\n  myArray.push(newItem);\n}",
        confidence: 88,
      };
    }

    if (
      errorLower.includes("rangeerror") ||
      errorLower.includes("maximum call stack")
    ) {
      return {
        explanation:
          "Your code is stuck in infinite recursion or an infinite loop. This happens when a function keeps calling itself without ever reaching a stopping condition.",
        suggestedFix:
          "1. Add a base case to stop recursion\n2. Check that your recursive calls are getting closer to the base case\n3. Verify loop conditions and increments\n4. Add debugging to see the call stack",
        codeExample:
          "// Fixed recursion example:\nfunction factorial(n) {\n  if (n <= 1) return 1; // ← Base case!\n  return n * factorial(n - 1);\n}",
        confidence: 92,
      };
    }

    if (
      errorLower.includes("timeout") ||
      errorLower.includes("time limit exceeded")
    ) {
      return {
        explanation:
          "Your algorithm is too slow and exceeded the time limit. This usually means you need a more efficient approach or there's an infinite loop.",
        suggestedFix:
          "1. Look for nested loops that can be optimized\n2. Check for infinite loops\n3. Use more efficient data structures (Map, Set)\n4. Consider algorithms with better time complexity\n5. Add early termination conditions",
        codeExample:
          "// Use Map for O(1) lookups instead of nested loops:\nconst map = new Map();\nfor (let item of array) {\n  if (map.has(target - item)) return true;\n  map.set(item, true);\n}",
        confidence: 85,
      };
    }

    if (
      codeLower.includes("for") ||
      codeLower.includes("while") ||
      codeLower.includes("array")
    ) {
      return {
        explanation:
          "Your code involves loops or arrays. Common issues include infinite loops, incorrect array access, or off-by-one errors in loop conditions.",
        suggestedFix:
          "1. Check loop conditions and increments\n2. Verify array bounds (0 to length-1)\n3. Add console.log to debug loop iterations\n4. Ensure loop variables are being modified\n5. Check for off-by-one errors",
        codeExample:
          "// Safe array iteration:\nfor (let i = 0; i < array.length; i++) {\n  console.log('Processing:', array[i]);\n  // Your logic here\n}",
        confidence: 75,
      };
    }

    return {
      explanation: `I've analyzed your code for the problem: "${problemStatement}". ${
        errorLog
          ? `The error "${errorLog}" suggests there might be logical or syntax issues.`
          : "No specific error was provided, but I can help you debug."
      } Let's work through this systematically.`,
      suggestedFix:
        "1. Add console.log statements to track variable values\n2. Test with simple inputs first\n3. Check each part of your algorithm step by step\n4. Verify your approach matches the problem requirements\n5. Look for common issues like typos, wrong operators, or logical errors",
      codeExample:
        "// Debug template:\nconsole.log('Input:', input);\n// Your code here\nconsole.log('Output:', result);",
      confidence: 60,
    };
  }
}
