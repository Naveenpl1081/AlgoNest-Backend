import { Document } from "mongodb";
export interface IOtp extends Document {
  _id: string;
  email: string;
  otp: string;
}
