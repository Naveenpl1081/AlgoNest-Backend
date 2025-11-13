import { ISubscriptionPlan } from "../models/IsubcriptionPlan";

export interface ISubscriptionPlanRepository {
    addSubscriptionPlan(data: {
      planName: string;
      price: number;
      durationInMonths: number;
      description?: string;
    }): Promise<ISubscriptionPlan>;
    findByPlanName(planName: string): Promise<ISubscriptionPlan | null> 
    getSubscriptionPlan(options: {
        page?: number;
        limit?: number;
        search?: string;
        status?: string;
      }): Promise<{
        data: ISubscriptionPlan[];
        total: number;
        page: number;
        limit: number;
        pages: number;
      }> 
      showAllSubscriptionPlan(): Promise<{ data: ISubscriptionPlan[] }>
      findSubscriptionPlanById(
        id: string
      ): Promise<ISubscriptionPlan | null>
      findSubcriptionAndUpdate(
        subscriptionId: string,
        status: "Active" | "InActive"
      ): Promise<ISubscriptionPlan | null>
      findSubscriptionById(id: string): Promise<ISubscriptionPlan | null>
      updateSubscription(
        subscriptionId: string,
        data: Partial<ISubscriptionPlan>
      ): Promise<ISubscriptionPlan | null>
}