import { IProblemResponse, ProblemListResponse } from "../DTO/IServices/IProblemServise";
import { IProblem } from "../models/Iproblem";
import { SingleProblemResponse } from "../DTO/IServices/IProblemServise";

export interface IProblemService{
    getAllProblems(options: {
        page?: number;
        limit?: number;
        status?:string;
        search?:string
        verified?:string
      }): Promise<ProblemListResponse>;
      addProblem(problem: IProblem): Promise<{ success: boolean; message: string }>
      updateProblem(problemId: string, data: IProblem): Promise<{ success: boolean; message: string }>
      getVisibleProblems(query?: string,difficulty?:string): Promise<IProblem[]>
      getSingleProblem(id: string): Promise<SingleProblemResponse>
      findOneProblem(problemId: string): Promise<{
        success: boolean;
        message: string;
        data?: {
          id: string;
          status: string;
        };
      }> 
}