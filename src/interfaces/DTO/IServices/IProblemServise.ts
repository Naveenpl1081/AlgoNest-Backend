import { IProblem } from "../../models/Iproblem";

export interface ITestCaseResponse {
    input: string[];
    output: string;
  }
  

  export interface IExampleResponse {
    input: string;
    output: string;
    explanation?: string;
  }

  export interface IParameterResponse {
    name: string;
    type: string;
  }
  

  export interface IStarterCodeResponse {
    [language: string]: string;
  }
  

  export interface IProblemResponse {
    _id: string; 
    problemId: string;
    title: string;
    description: string;
    difficulty: string;
    tags: string[];
    category: string; 
    constraints: string[];
    testCases: ITestCaseResponse[];
    examples: IExampleResponse[];
    functionName: string;
    status: string;
    timeLimit: string;
    memoryLimit: string;
    parameters: IParameterResponse[];
    returnType: string;
    isPremium: boolean;
    visible: boolean;
    solution: string;
    starterCode: IStarterCodeResponse;
    hints: string[];
    createdAt?: Date;
    updatedAt?: Date;
  }
  
  

  export interface ProblemListResponse {
    success: boolean;
    message: string;
    data?: {
      problems: IProblemResponse[];
      pagination: {
        total: number;
        page: number;
        pages: number;
        limit: number;
        hasNextPage: boolean;
        hasPrevPage: boolean;
      };
    };
  }

  export interface SingleProblemResponse {
    message: string;
    success: boolean;
    problem?: IProblem;
  }