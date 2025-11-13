import { ISubscriptionPlan, ISubscriptionPlanResponse } from "../models/IsubcriptionPlan";


export interface ISubscriptionPlanService {
  addSubscriptionPlan(data: {
    planName: string;
    price: number;
    durationInMonths: number;
    description?: string;
  }): Promise<{
    message: string;
    success: boolean;
    data?: ISubscriptionPlan;
  }>;
  getSubscriptionPlan(options:{
    page?:number,
    limit?:number,
    search?:string,
    status?:string,
  }):Promise<ISubscriptionPlanResponse>
  showAllSubscriptionPlan():Promise<ISubscriptionPlanResponse>
  purchasePlan(
    userId: String,
    planId: string
  ): Promise<{
    message: string;
    success: boolean;
    data?: {
      checkoutUrl: string;
    };
  }>
  verifyStripeSession(
    userId: string,
    sessionId: string
  ): Promise<{
    success: boolean;
    message: string;
    data?: {
      currentSubscription: {
        planName: string;
        status: string;
        durationInMonths: number;
        expiresAt?: string;
        amount: number;
      };
    };
  }> 
  findOneSubscription(subscriptionId: string): Promise<{
    success: boolean;
    message: string;
    data?: {
      id: string;
      status: string;
    };
  }>
  updateSubscription(
    subscriptionId: string,
    data: ISubscriptionPlan
  ): Promise<{ success: boolean; message: string }> 

}