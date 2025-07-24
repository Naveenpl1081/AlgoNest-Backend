import mongoose, { Schema } from "mongoose";
import { ITempUser } from "../interfaces/models/ItemUser";

const pendingUserSchema: Schema<ITempUser> = new Schema(
  {
    username: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    otp: { type: String, required: true },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true }
);

pendingUserSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 60 });

const PendingUser = mongoose.model<ITempUser>("PendingUser", pendingUserSchema);
export default PendingUser;
