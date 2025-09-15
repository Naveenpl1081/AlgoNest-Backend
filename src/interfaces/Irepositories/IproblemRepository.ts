import { FilterQuery } from "mongoose";
import { IProblem } from "../models/Iproblem";

export interface IProblemRepository {
  getAllProblems(options: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    verified?:string
  }): Promise<{
    data: IProblem[];
    total: number;
    page: number;
    limit: number;
    pages: number;
  }>;
  addProblem(problem:IProblem):Promise<IProblem>
  findProblemById(problemId: string): Promise<IProblem | null> 
  updateProblem(problemId: string, data: IProblem): Promise<IProblem | null>
  getVisibleProblems(filter: FilterQuery<IProblem>): Promise<IProblem[]>
  findProblemAndUpdate(
    categoryId: string,
    status: "Active" | "InActive"
  ): Promise<IProblem | null> 
}
