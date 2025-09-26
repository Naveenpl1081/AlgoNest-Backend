import { injectable, inject } from "tsyringe";
import { IExecuteRepository } from "../interfaces/Irepositories/IexecuteRepository";
import { IProblemRepository } from "../interfaces/Irepositories/IproblemRepository";
import { IExecuteService } from "../interfaces/Iserveices/IexecuteService";
import { IUserStats } from "../interfaces/DTO/IServices/IUserServise";
import {
  ExecuteRunDTO,
  ExecuteRunResponse,
  ExecuteSubmitResponse,
  IRecentSubmission,
} from "../interfaces/DTO/IServices/IExecuteService";
import { ITestExecutor } from "../interfaces/Iexecute/ITestExecutor";
import { IRunResponse } from "../interfaces/DTO/IServices/ISubmissionService";

@injectable()
export class ExecuteService implements IExecuteService {
  constructor(
    @inject("IExecuteRepository")
    private _executeRepository: IExecuteRepository,
    @inject("IProblemRepository")
    private _problemRepository: IProblemRepository,
    @inject("ITestExecutor") private _testExecutor: ITestExecutor
  ) {}

  async executeSubmit(dto: ExecuteRunDTO): Promise<ExecuteSubmitResponse> {
    const { code, language, problemId, userId } = dto;

    try {
      const problem = await this._problemRepository.findProblemById(problemId);
      if (!problem) {
        throw new Error("Problem not found");
      }

      if (!problem.testCases || problem.testCases.length === 0) {
        throw new Error("No test cases available");
      }

      const testResults = [];
      let overallConsoleOutput = "";

      for (let i = 0; i < problem.testCases.length; i++) {
        const testCase = problem.testCases[i];
        console.log("testcases", testCase);
        const result = await this._testExecutor.runSingleTest(
          code,
          language,
          testCase,
          problem.functionName,
          Number(problem.timeLimit),
          Number(problem.memoryLimit),
          i + 1
        );

        testResults.push(result);

        if (result.consoleOutput && result.consoleOutput.trim()) {
          if (overallConsoleOutput) {
            overallConsoleOutput += "\n\n" + result.consoleOutput;
          } else {
            overallConsoleOutput = result.consoleOutput;
          }
        }
      }

      const passedTests = testResults.filter((result) => result.passed).length;
      const totalTests = testResults.length;
      const overallStatus = passedTests === totalTests ? "passed" : "failed";

      const run = await this._executeRepository.createRun({
        userId,
        problemId,
        language,
        code,
        testResults,
        overallStatus,
      });

      return {
        success: true,
        testResults,
        overallStatus,
        runId: run._id?.toString() || "unknown",
        consoleOutput: overallConsoleOutput,
        summary: {
          totalTests,
          passedTests,
          failedTests: totalTests - passedTests,
        },
      };
    } catch (error) {
      console.error("Execution error:", error);

      try {
        await this._executeRepository.createRun({
          userId,
          problemId,
          language,
          code,
          testResults: [
            {
              caseNumber: 1,
              input: "N/A",
              output:
                "System Error: " +
                (error instanceof Error ? error.message : "Unknown error"),
              expected: "N/A",
              passed: false,
              error: error instanceof Error ? error.message : "Unknown error",
            },
          ],
          overallStatus: "error",
        });
      } catch (saveError) {
        console.error("Failed to save error run:", saveError);
      }

      throw error;
    }
  }

  async executeRun(dto: ExecuteRunDTO): Promise<ExecuteRunResponse> {
    const { code, language, problemId, userId } = dto;
    try {
      const problem = await this._problemRepository.findProblemById(problemId);
      if (!problem) {
        throw new Error("Problem not found");
      }

      const testCase = problem.testCases[0];
      if (!testCase) {
        throw new Error("No test cases available");
      }

      const result = await this._testExecutor.runSingleTest(
        code,
        language,
        testCase,
        problem.functionName,
        Number(problem.timeLimit),
        Number(problem.memoryLimit),
        1
      );

      return {
        success: true,
        testResults: [result],
        overallStatus: result.passed ? "passed" : "failed",
        consoleOutput: result.consoleOutput || "",
      };
    } catch (error) {
      console.error("Execution error:", error);

      try {
        await this._executeRepository.createRun({
          userId,
          problemId,
          language,
          code,
          testResults: [
            {
              caseNumber: 1,
              input: "N/A",
              output:
                "System Error: " +
                (error instanceof Error ? error.message : "Unknown error"),
              expected: "N/A",
              passed: false,
              error: error instanceof Error ? error.message : "Unknown error",
            },
          ],
          overallStatus: "error",
        });
      } catch (saveError) {
        console.error("Failed to save error run:", saveError);
      }

      throw error;
    }
  }

  async allSubmissionService(
    userId: string,
    problemId: string
  ): Promise<IRunResponse[] | null> {
    try {
      const data = await this._executeRepository.findRunsByProblemIdAndUserId(
        userId,
        problemId
      );
      if (!data || data.length === 0) {
        return null;
      }
      const mappedData: IRunResponse[] = data.map((run) => ({
        userId: run.userId,
        problemId: run.problemId,
        language: run.language,
        code: run.code,
        testResults: run.testResults.map((test) => ({
          caseNumber: test.caseNumber,
          input: test.input,
          output: test.output,
          expected: test.expected,
          passed: test.passed,
          error: test.error,
          executionTime: test.executionTime,
          memoryUsed: test.memoryUsed,
        })),
        overallStatus: run.overallStatus,
        createdAt: run.createdAt,
      }));

      return mappedData;
    } catch (error) {
      console.error("Error in allSubmissionService:", error);
      throw error;
    }
  }

  async getUserStats(userId: string): Promise<IUserStats> {
    console.log("reached getUserStats");
    const submissions = await this._executeRepository.findUserRuns(userId) ?? [];
    const totalSubmissions = submissions.length;
    
    // Sort submissions by date (most recent first)
    const sortedSubmissions = submissions.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    
    const solvedProblems = new Set(
      submissions
        .filter(s => s?.overallStatus === "passed")
        .map(s => s.problemId)
    );
    const problemsSolved = solvedProblems.size;
    
    const acceptanceRate = totalSubmissions > 0
      ? Math.round((problemsSolved / totalSubmissions) * 100)
      : 0;
    
    const attemptingProblems = new Set(
      submissions
        .filter(s => s?.overallStatus !== "passed" && !solvedProblems.has(s.problemId))
        .map(s => s.problemId)
    );
    const attempting = attemptingProblems.size;
    const currentStreak = this.calculateStreak(submissions);
    
    const [easyTotal, mediumTotal, hardTotal] = await Promise.all([
      this._problemRepository.countByDifficulty("Easy"),
      this._problemRepository.countByDifficulty("Medium"),
      this._problemRepository.countByDifficulty("Hard"),
    ]);
    const totalProblems = easyTotal + mediumTotal + hardTotal;
    
    // Get recent unique problems (remove duplicates, keep most recent submission for each problem)
    const recentUniqueSubmissions = this.getRecentUniqueProblems(sortedSubmissions, 3);
    const recentProblemIds = recentUniqueSubmissions.map(s => s.problemId);
    
    // Get all unique problem IDs (both solved and recent)
    const allProblemIds = Array.from(new Set([...Array.from(solvedProblems), ...recentProblemIds]));
    
    console.log("Searching for problem IDs:", allProblemIds);
    const allProblemDocs = await this._problemRepository.getSolvedProblems(allProblemIds);
    console.log("Found problem docs:", allProblemDocs);
    
    // Create a map for quick problem lookup
    const problemMap = new Map();
    allProblemDocs.forEach(problem => {
      const id =  problem._id;
      if (id) problemMap.set(id.toString(), problem);
    });
    
    // Calculate solved by difficulty
    const solvedProblemDocs = allProblemDocs.filter(p => {
      const id =  p._id ;
      return id && solvedProblems.has(id.toString());
    });
    
    const easySolved = solvedProblemDocs.filter(p => p.difficulty === "Easy").length;
    const mediumSolved = solvedProblemDocs.filter(p => p.difficulty === "Medium").length;
    const hardSolved = solvedProblemDocs.filter(p => p.difficulty === "Hard").length;
  
    // Build recent submissions with problem details
    const recentSubmissions: IRecentSubmission[] = recentUniqueSubmissions.map(run => {
      const problem = problemMap.get(run.problemId);
      return {
        problemId: run.problemId,
        problemTitle: problem?.title || problem?.name || `Problem ${run.problemId}`,
        difficulty: problem?.difficulty || "Unknown",
        overallStatus: run.overallStatus,
        createdAt: run.createdAt
      };
    });
    
    return {
      problemsSolved,
      acceptanceRate,
      currentStreak,
      totalSubmissions,
      totalProblems,
      attempting,
      easy: { solved: easySolved, total: easyTotal },
      medium: { solved: mediumSolved, total: mediumTotal },
      hard: { solved: hardSolved, total: hardTotal },
      recentSubmissions,
    };
  }
  
  // Helper method to get recent unique problems (removes duplicates)
  private getRecentUniqueProblems(sortedSubmissions: any[], limit: number = 3): any[] {
    const uniqueProblems = new Map();
    
    // Iterate through sorted submissions and keep only the most recent submission for each unique problem
    for (const submission of sortedSubmissions) {
      if (!uniqueProblems.has(submission.problemId)) {
        uniqueProblems.set(submission.problemId, submission);
        
        // Stop when we have enough unique problems
        if (uniqueProblems.size >= limit) {
          break;
        }
      }
    }
    
    // Convert map values back to array and maintain chronological order
    return Array.from(uniqueProblems.values());
  }

  private calculateStreak(submissions: any[]): number {
    const solvedDates = submissions
      .filter((s) => s.overallStatus === "passed")
      .map((s) => new Date(s.createdAt).toDateString());

    const uniqueDates = Array.from(new Set(solvedDates)).sort(
      (a, b) => new Date(b).getTime() - new Date(a).getTime()
    );

    let streak = 0;
    let currentDate = new Date();

    for (let date of uniqueDates) {
      if (new Date(date).toDateString() === currentDate.toDateString()) {
        streak++;
        currentDate.setDate(currentDate.getDate() - 1);
      } else {
        break;
      }
    }
    return streak;
  }
}
