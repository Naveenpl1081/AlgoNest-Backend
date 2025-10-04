import { Document } from "mongoose";

export interface IJobPost extends Document {
  _id: string;
  jobrole: string;
  jobLocation: string;
  workTime: "full-time" | "part-time" | "contract" | "internship";
  workMode: "remote" | "on-site" | "hybrid";
  minExperience: number;
  minSalary: number;
  maxSalary: number;
  requirements: string[];
  responsibilities: string[];
  recruiterId: string;
  status?: "Active" | "InActive" ;
  applicationsCount: number;
  createdAt: Date;
  updatedAt: Date;
}



