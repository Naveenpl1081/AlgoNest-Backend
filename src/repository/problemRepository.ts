import { IProblemRepository } from "../interfaces/Irepositories/IproblemRepository";
import { IProblem } from "../interfaces/models/Iproblem";
import { BaseRepository } from "../repository/baseRepository";
import Problem from "../models/problemSchema";
import { FilterQuery, Types } from "mongoose";

export class ProblemRepository
  extends BaseRepository<IProblem>
  implements IProblemRepository
{
  constructor() {
    super(Problem);
  }
  async getAllProblems(options: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    verified?: string;
  }): Promise<{
    data: IProblem[];
    total: number;
    page: number;
    limit: number;
    pages: number;
  }> {
    const filter: FilterQuery<IProblem> = {};

    if (options.search) {
      filter.$or = [
        { title: { $regex: options.search, $options: "i" } },
        { problemId: { $regex: options.search, $options: "i" } },
      ];
    }

    if (options.status) {
      if (options.status === "easy") {
        filter.difficulty = "Easy";
      } else if (options.status === "medium") {
        filter.difficulty = "Medium";
      } else if (options.status === "hard") {
        filter.difficulty = "Hard";
      }
    }

    if (options.verified) {
      if (options.verified === "active") {
        filter.status = "Active";
      } else if (options.verified === "blocked") {
        filter.status = "InActive";
      }
    }

    const page = options.page || 1;
    const limit = options.limit || 5;

    const result = (await this.find(filter, {
      pagination: { page, limit },
      sort: { createdAt: -1 },
    })) as { data: IProblem[]; total: number };

    return {
      data: result.data,
      total: result.total,
      page,
      limit,
      pages: Math.ceil(result.total / limit),
    };
  }

  async checkDuplicateProblem(
    title: string,
    problemId: string
  ): Promise<boolean> {
    try {
      const filter: FilterQuery<IProblem> = {
        $or: [
          { title: { $regex: new RegExp(`^${title}$`, "i") } },
          { problemId: { $regex: new RegExp(`^${problemId}$`, "i") } },
        ],
      };

      const existingProblem = await this.findOne(filter);
      return !!existingProblem;
    } catch (error) {
      console.error("Error checking duplicate problem:", error);
      throw new Error("Error checking duplicate problem");
    }
  }

  async addProblem(problem: Partial<IProblem>): Promise<IProblem> {
    try {
      const { _id, ...problemWithoutId } = problem;
      const cleanProblem = _id ? problem : problemWithoutId;

      const newProblem = await this.create(cleanProblem);

      return newProblem;
    } catch (error) {
      console.error("error occurred while creating the problem", error);
      throw new Error("An error occurred while creating the problem");
    }
  }
  async findProblemById(problemId: string): Promise<IProblem | null> {
    try {
      if (!problemId || problemId.length !== 24) {
        throw new Error("Invalid problem ID format");
      }

      const problem = await this.findById(problemId);
      return problem;
    } catch (error) {
      console.error("Error finding problem by ID:", error);
      return null;
    }
  }

  async updateProblem(
    problemId: string,
    data: Partial<IProblem>
  ): Promise<IProblem | null> {
    try {
      if (!problemId || problemId.length !== 24) {
        throw new Error("Invalid problem ID format");
      }

      const { _id, ...updateData } = data;
      console.log(_id);

      const updatedProblem = await this.updateOne(
        new Types.ObjectId(problemId),
        updateData
      );

      if (!updatedProblem) {
        return null;
      }
      return updatedProblem;
    } catch (error) {
      console.error("Error updating problem:", error);
      throw new Error("An error occurred while updating the problem");
    }
  }

  async getVisibleProblems(
    filter: FilterQuery<IProblem> = {}
  ): Promise<IProblem[]> {
    try {
      return await Problem.find(filter)
        .populate("category", "name")
        .select(
          "problemId title description difficulty category tags isPremium createdAt updatedAt"
        )
        .sort({ createdAt: -1 })
        .lean()
        .exec();
    } catch (error) {
      console.error("Error in getVisibleProblems:", error);
      throw new Error("Failed to fetch visible problems");
    }
  }

  async findProblemAndUpdate(
    categoryId: string,
    status: "Active" | "InActive"
  ): Promise<IProblem | null> {
    try {
      const problem = await Problem.findOneAndUpdate(
        { _id: categoryId },
        { $set: { status: status } },
        { new: true }
      );
      return problem;
    } catch (error) {
      console.error(error);
      return null;
    }
  }
  async countByDifficulty(difficulty: "Easy" | "Medium" | "Hard"): Promise<number> {
    return this.model.countDocuments({ difficulty }).exec();
  }
  async getSolvedProblems(problemIds: string[]): Promise<IProblem[]> {
    console.log("getSolvedProblems called with:", problemIds);
    if (!problemIds || problemIds.length === 0) {
      console.log("No problem IDs provided");
      return [];
    }
    
    let result = await this.model.find({ problemId: { $in: problemIds } }).exec();
    if (result.length === 0) {
      console.log("No results with problemId field, trying _id field");
      result = await this.model.find({ _id: { $in: problemIds } }).exec();
    }
    if (result.length === 0) {
      console.log("No results with _id field, trying id field");
      result = await this.model.find({ id: { $in: problemIds } }).exec();
    }
    
    console.log("Final result:", result);
    return result;
  }
}
