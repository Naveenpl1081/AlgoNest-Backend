
import mongoose, { Schema } from "mongoose";
import { ISubscriptionPlan } from "../interfaces/models/IsubcriptionPlan";

const subscriptrionPlanSchema: Schema<ISubscriptionPlan> = new Schema(
  {
    planName: {
      type: String,
      required: true,
      unique: true,
    },
    price: {
      type: Number,
      required: true,
    },
    durationInMonths: {
      type: Number,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    status: {
        type: String,
        enum: ["Active", "InActive"],
        default: "Active",
      },
  },
  { timestamps: true }
);

const subscriptionPlan = mongoose.model<ISubscriptionPlan>(
  "subscriptionPlan",
  subscriptrionPlanSchema
);

export default subscriptionPlan;