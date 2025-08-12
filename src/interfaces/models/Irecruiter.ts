import { Document } from "mongoose";

export interface IRecruiter extends Document {
  _id: string;
  username: string;
  email: string;
  password: string;
  status?: "Active" | "InActive";
  isVerified?:Boolean
  createdAt?: Date;
  updatedAt?: Date;
}
