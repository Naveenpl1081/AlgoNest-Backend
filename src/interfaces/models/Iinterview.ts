import { Types, Document } from "mongoose";


export interface IInterviewBase {
  recruiterId: Types.ObjectId;
  candidateId: Types.ObjectId;
  jobId?: Types.ObjectId;
  date: Date;
  time: string;
  duration: string;
  instructions?: string;
  roomId: string;
  status?: "scheduled" | "completed" | "cancelled";
}


export interface IInterview extends IInterviewBase, Document {
  createdAt?: Date;
  updatedAt?: Date;
}


export interface IInterviewInput {
  recruiterId: Types.ObjectId;
  candidateId: Types.ObjectId;
  jobId?: Types.ObjectId;
  date: Date;
  time: string;
  duration: string;
  instructions?: string;
}