import { Document, Types } from "mongoose";

export interface IProblem extends Document {
  _id:string
  problemId: string;
  title: string;
  description: string;
  difficulty: string;
  tags: string[];
  category:Types.ObjectId
  constraints: string[];
  testCases: {
    input: string[];
    output: string;
  }[];  
  examples: {
    input: string;
    output: string;
    explanation?: string;
  }[];
  functionName: string;
  status:string;
  timeLimit:string;
  memoryLimit:string;
  parameters: {
    name: string;
    type: string;
  }[];
  returnType: string;
  isPremium: boolean;
  visible: boolean;
  solution: string;
  starterCode: {
    [language: string]: string;
  };
  hints: string[]; 
  createdAt?: Date;
  updatedAt?: Date;
}



export interface SingleProblemResponse {
  message: string;
  success: boolean;
  problem?: IProblem;
}