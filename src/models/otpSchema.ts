import mongoose, { Schema } from "mongoose";
import { IOtp } from "../interfaces/models/IOtp";

const otpSchema: Schema<IOtp> = new Schema({
  email: { type: String, required: true },
  otp: { type: String, required: true },
  createdAt: { type: Date, default: Date.now, expires: 60 },
});

const Otp = mongoose.model<IOtp>("Otp", otpSchema);
export default Otp;