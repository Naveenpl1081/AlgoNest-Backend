import { injectable,inject } from "tsyringe";
import { IProblemRepository } from "../interfaces/Irepositories/IproblemRepository";
import { IProblemService } from "../interfaces/Iserveices/IproblemService";
import { IProblem, SingleProblemResponse } from "../interfaces/models/Iproblem";


@injectable()
export class ProblemService implements IProblemService {
  constructor(@inject("IProblemRepository") private _problemRepository: IProblemRepository,) {}
  async getAllProblems(options: {
    page?: number 
    limit?: number 
    search?: string;
    status?: string;
    verified?:string
  }): Promise<{
    success: boolean;
    message: string;
    data?: {
          problems: IProblem[];
          pagination: {
            total: number;
            page: number;
            pages: number;
            limit: number;
            hasNextPage: boolean;
            hasPrevPage: boolean;
          };
        }
  }> {
    try {
      console.log("Function fetching all the users");
      const page = options.page || 1;
      const limit = options.limit || 5;
      const result = await this._problemRepository.getAllProblems({
        page,
        limit,
        search: options.search,
        status: options.status,
        verified:options.verified
      });

      console.log("result from the problem service:", result);

      return {
        success: true,
        message: "problems fetched successfully",
        data: {
          problems: result.data,
          pagination: {
            total: result.total,
            page: result.page,
            pages: result.pages,
            limit: limit,
            hasNextPage: result.page < result.pages,
            hasPrevPage: page > 1,
          },
        },
      };
    } catch (error) {
      console.error("Error in problem:", error);
      return {
        message: "failed to create problem",
        success: false,
      };
    }
  }

  async addProblem(problem: IProblem): Promise<{ success: boolean; message: string }> {
    try {
      console.log("service prob",problem)
      const newProblem = await this._problemRepository.addProblem(problem);
      return {
        success: true,
        message: "Problem added successfully",
      };
    } catch (error: unknown) {
      const err = error as Error;
      return {
        success: false,
        message: err.message || "Failed to add problem",
      };
    }
  }
  async updateProblem(problemId: string, data: IProblem): Promise<{ success: boolean; message: string }> {
    try {
      const existingProblem = await this._problemRepository.findProblemById(problemId);
      if (!existingProblem) {
        return { success: false, message: "Problem not found" };
      }

      await this._problemRepository.updateProblem(problemId, data);

      return { success: true, message: "Problem updated successfully" };
    } catch (error: unknown) {
      const err = error as Error;
      console.error("Error in updateProblem service:", err.message);
      return { success: false, message: err.message || "Failed to update problem" };
    }
  }

  async getVisibleProblems(query?: string,difficulty?:string): Promise<IProblem[]> {
    try {
      const filter: any = { visible: true ,status:"Active"};
  
      if (query) {
        filter.$or = [
          { title: { $regex: query, $options: 'i' } },
          { description: { $regex: query, $options: 'i' } },
          { problemId: query } 
        ];
      }

      if (difficulty) {
        filter.difficulty = { $regex: `^${difficulty}$`, $options: 'i' };
      }
  
      return await this._problemRepository.getVisibleProblems(filter);
    } catch (error) {
      console.error('Error in service getVisibleProblems:', error);
      throw new Error('Failed to fetch visible problems from service layer');
    }
  }
  

  async getSingleProblem(id: string): Promise<SingleProblemResponse> {
    try {
      const problem = await this._problemRepository.findProblemById(id);

      if (!problem) {
        return {
          message: "Problem not found",
          success: false,
        };
      }

      return {
        message: "Successfully fetched problem",
        success: true,
        problem: problem,
      };
    } catch (error) {
      console.error("Error in getSingleProblem service:", error);
      return {
        message: "Error retrieving problem",
        success: false,
      };
    }
  }
  async findOneProblem(problemId: string): Promise<{
    success: boolean;
    message: string;
    data?: {
      id: string;
      status: string;
    };
  }> {
    try {
      const problem = await this._problemRepository.findProblemById(problemId);

      if (!problem) {
        return {
          success: false,
          message: "problem not found",
        };
      }
      const newStatus =problem.status === "Active" ? "InActive" : "Active";
      console.log("problemstauts", newStatus);
      const updatedProblem = await this._problemRepository.findProblemAndUpdate(
        problemId,
        newStatus
      );
      console.log("updatedproblem", updatedProblem);
      if (!updatedProblem) {
        return {
          success: false,
          message: "failed to change problem data",
        };
      }
      return {
        success: true,
        message: "problem updated successfully",
        data: {
          id: updatedProblem._id,
          status: updatedProblem?.status,
        },
      };
    } catch (error) {
      console.error("error occured:", error);
      throw error;
    }
  }
}
