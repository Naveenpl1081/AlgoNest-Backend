import { Document, Types } from "mongoose";

export interface IPayment extends Document {
  _id: Types.ObjectId;
  userId?: Types.ObjectId;
  subscriptionPlanId?: Types.ObjectId;
  amountPaid: number;
  paymentStatus: "Partial Paid" | "Paid" | "Refunded";
  createdAt: Date;
  updatedAt: Date;
}

export interface CreatePaymentData {
    userId?: string
    subscriptionPlanId?:string
    amountPaid: number;
    paymentStatus: "Partial Paid" | "Paid" | "Refunded";
  }