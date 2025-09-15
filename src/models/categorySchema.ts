import mongoose, { Schema, Document } from "mongoose";
import { ICategory } from "../interfaces/models/Icategory";

const CategorySchema: Schema<ICategory> = new Schema({
    name: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["Active", "InActive"],
      default: "Active",
    },
  }, { timestamps: true });
  
const Category = mongoose.model<ICategory>("Category", CategorySchema);

export default Category;
