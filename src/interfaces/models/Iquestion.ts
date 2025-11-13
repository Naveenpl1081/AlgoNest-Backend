import { Document, Types } from "mongoose";

export interface IQuestion extends Document {
  _id: string;
  userId: Types.ObjectId | IUser;
  title: string;
  description: string;
  tags: string[];
  upvotes: number;
  downvotes: number;
  answersCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface IQuestionInput {
  title: string;
  description: string;
  tags: string[];
}

export interface IQuestionResponse {
  _id: string;
  userDetails: {
    _id:string;
    username: string;
    email: string;
  };
  title: string;
  description: string;
  tags: string[];
  upvotes: number;
  downvotes: number;
  answersCount: number;
  createdAt: Date;
  updatedAt: Date;
}
interface IUser {
  _id: string;
  username: string;
  email: string;
}




