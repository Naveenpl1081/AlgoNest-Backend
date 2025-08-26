import { Schema, model } from "mongoose";
import { IAdmin } from "../interfaces/models/Iadmin";



const adminSchema = new Schema<IAdmin>(
  {
    email: { type: String, required: true},
    password: { type: String, required: true },
    
  },
  { timestamps: true }
);

export const AdminSchema = model<IAdmin>("Admin", adminSchema);
