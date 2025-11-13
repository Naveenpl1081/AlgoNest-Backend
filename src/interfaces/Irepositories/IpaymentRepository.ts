import { CreatePaymentData, IPayment } from "../models/Ipayment";


export interface IPaymentRepository{
    createPayment(paymentData: CreatePaymentData): Promise<IPayment>
}