import { Document } from "mongoose";

export interface IUser extends Document {
  _id: string;
  username: string;
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  github?: string;
  linkedin?: string;
  profileImage?: string;
  status?: string
  createdAt?: Date;
  updatedAt?: Date;
  isVerified?:boolean
}

