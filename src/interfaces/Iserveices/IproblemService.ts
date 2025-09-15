import { IProblem, SingleProblemResponse } from "../models/Iproblem";

export interface IProblemService{
    getAllProblems(options: {
        page?: number;
        limit?: number;
        status?:string;
        search?:string
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
        };
      }>;
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