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

export interface IScheduledInterviewInput {
  interviewId?:string,
  date: Date;
  time: string;
  duration: string;
  instructions?: string;
}


export interface IPopulatedCandidate {
  _id: Types.ObjectId;
  username: string;
  email: string;
}

export interface IPopulatedJob {
  _id: Types.ObjectId;
  jobrole: string;
}


export interface IInterviewPopulated extends Document {
  _id: Types.ObjectId;
  recruiterId: Types.ObjectId;
  candidateId: IPopulatedCandidate;
  jobId?: IPopulatedJob;
  date: Date;
  time: string;
  duration: string;
  instructions?: string;
  roomId: string;
  status: "scheduled" | "completed" | "cancelled";
  createdAt?: Date;
  updatedAt?: Date;
}