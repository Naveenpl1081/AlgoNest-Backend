import mongoose, { Schema } from "mongoose";
import { IUser } from "../interfaces/models/Iuser";

const userSchema: Schema<IUser> = new Schema(
  {
    username: {
      type: String,
      required: true, 
    },
    email: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["Active", "InActive"],
      default: "Active",
    },
    firstName: {
      type: String,
      default: "",
    },
    lastName: {
      type: String,
      default: "",
    },
    github: {
      type: String,
      default: "",
    },
    linkedin: {
      type: String,
      default: "",
    },
    profileImage: {
      type: String,
      default: "", 
    },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model<IUser>("User", userSchema);
export default User;
