
import { injectable } from "tsyringe";
import { BaseRepository } from "./baseRepository";

import mongoose, { FilterQuery, Types } from "mongoose";
import { CreatePaymentData, IPayment } from "../interfaces/models/Ipayment";
import payment from "../models/paymentSchema";
import { IPaymentRepository } from "../interfaces/Irepositories/IpaymentRepository";

@injectable()
export class PaymentRepository
  extends BaseRepository<IPayment>
  implements IPaymentRepository
{
  constructor() {
    super(payment);
  }

  async createPayment(paymentData: CreatePaymentData): Promise<IPayment> {
    try {
      console.log(
        "entering to the create payment method in the payment repository"
      );
      console.log("paymentData in the createPayment Method:", paymentData);

      const mongoPaymentData: Partial<IPayment> = {};

      mongoPaymentData.userId = new Types.ObjectId(
        paymentData.userId
      );
      mongoPaymentData.amountPaid = paymentData.amountPaid;
      mongoPaymentData.paymentStatus = paymentData.paymentStatus;

      if (paymentData.subscriptionPlanId) {
        mongoPaymentData.subscriptionPlanId = new Types.ObjectId(
          paymentData.subscriptionPlanId
        );
      }

      const newPayment = await this.create(mongoPaymentData);
      return newPayment;
    } catch (error) {
      console.log("error occurred while creating a payment:", error);
      throw error;
    }
  }
}