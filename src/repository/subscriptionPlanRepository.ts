import { BaseRepository } from "./baseRepository";

import { injectable } from "tsyringe";

import { ISubscriptionPlan } from "../interfaces/models/IsubcriptionPlan";
import subscriptionPlan from "../models/subscriptionSchema";
import { ISubscriptionPlanRepository } from "../interfaces/Irepositories/IsubscriptionPlanRepository";
import { FilterQuery, Types } from "mongoose";

@injectable()
export class SubscriptionPlanRepository
  extends BaseRepository<ISubscriptionPlan>
  implements ISubscriptionPlanRepository
{
  constructor() {
    super(subscriptionPlan);
  }

  async addSubscriptionPlan(data: {
    planName: string;
    price: number;
    durationInMonths: number;
    description: string;
  }): Promise<ISubscriptionPlan> {
    try {
      console.log(
        "entered the subscription plan repository method that adds the subscription plan"
      );
      const result = await this.create(data);
      return result;
    } catch (error) {
      console.log("error occurred while adding the subscription plan:", error);
      throw new Error("Error occurred while adding the subscription plan");
    }
  }

  async findByPlanName(planName: string): Promise<ISubscriptionPlan | null> {
    try {
      const result = await this.findOne({
        planName: { $regex: new RegExp(`^${planName}$`, "i") },
      });
      return result;
    } catch (error) {
      console.log(
        "error occurred while finding subscription plan by name:",
        error
      );
      throw new Error("Error occurred while finding subscription plan");
    }
  }

  async getSubscriptionPlan(options: {
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
  }> {
    try {
        const page = options.page || 1;
        const limit = options.limit || 5;
      const filter: FilterQuery<ISubscriptionPlan> = {};

      if (options.search) {
        filter.$or = [
          {planName : { $regex: options.search, $options: "i" } },
          { description: { $regex: options.search, $options: "i" } },
        ];
      }
  
      if (options.status) {
        if (options.status === "active") {
          filter.status = "Active";
        } else if (options.status === "blocked") {
          filter.status = "InActive";
        }
      }

      const result=(await this.find(filter,{
        pagination:{page,limit},
        sort:{createdAt:-1}
      })) as {data:ISubscriptionPlan[],total:number}

      return {
        data:result.data,
        total:result.total,
        page,
        limit,
        pages:Math.ceil(result.total/limit)
      }

    } catch (error) {
        console.error("error occurred while fetching the users:", error);
        throw new Error("Failed to fetch the users");
    }
  }

  async showAllSubscriptionPlan(): Promise<{ data: ISubscriptionPlan[] }> {
    try {
      const result = await this.find({}) as ISubscriptionPlan[];
      return { data: result };
    } catch (error) {
      console.error("error occurred while fetching the subscription plans:", error);
      throw new Error("Failed to fetch subscription plans");
    }
  }

  async findSubscriptionPlanById(
    id: string
  ): Promise<ISubscriptionPlan | null> {
    try {
      const subscriptionPlan = await this.findById(id);
      console.log(
        "fetched subscription plan from the subscription plan repository:",
        subscriptionPlan
      );
      return subscriptionPlan;
    } catch (error) {
      console.log("error occured while fetching the subscription plan:", error);
      return null;
    }
  }


  async findSubcriptionAndUpdate(
    subscriptionId: string,
    status: "Active" | "InActive"
  ): Promise<ISubscriptionPlan | null> {
    try {
      const subscription = await subscriptionPlan.findOneAndUpdate(
        { _id: subscriptionId },
        { $set: { status: status } },
        { new: true }
      );
      return subscription;
    } catch (error) {
      console.error(error);
      return null;
    }
  }
  async findSubscriptionById(id: string): Promise<ISubscriptionPlan | null> {
    try {
      const sunscription = await this.model.findById(id)
      return sunscription;
    } catch (error) {
      console.error(error);
      throw new Error("An error occurred while creating the subscription");
    }
  }

  async updateSubscription(
    subscriptionId: string,
    data: Partial<ISubscriptionPlan>
  ): Promise<ISubscriptionPlan | null> {
    try {
      if (!subscriptionId || subscriptionId.length !== 24) {
        throw new Error("Invalid category ID format");
      }

      const { _id, ...updateData } = data;
      console.log(_id);
      const updatedSubscription = await this.updateOne(
        new Types.ObjectId(subscriptionId),
        updateData
      );

      if (!updatedSubscription) {
        return null;
      }
      return updatedSubscription;
    } catch (error) {
      console.error("Error updating updatedSubscription:", error);
      throw new Error("An error occurred while updating the updatedSubscription");
    }
  }
  
}
