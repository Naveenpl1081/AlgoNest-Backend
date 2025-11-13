
import mongoose, { Schema } from "mongoose";
import { IPayment } from "../interfaces/models/Ipayment";

const paymentSchema: Schema<IPayment> = new Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
    },
    subscriptionPlanId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "subscriptionPlan",
    },
    amountPaid: {
      type: Number,
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ["Partial Paid", "Paid", "Refunded"],
      required: true,
    },
    
  },
  { timestamps: true }
);

const payment = mongoose.model<IPayment>("payment", paymentSchema);

export default payment;
