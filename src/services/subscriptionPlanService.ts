import Stripe from "stripe";
import { inject, injectable } from "tsyringe";
import { stripe } from "../config/stripe.config";
import { IPaymentRepository } from "../interfaces/Irepositories/IpaymentRepository";
import { ISubscriptionPlanRepository } from "../interfaces/Irepositories/IsubscriptionPlanRepository";
import { IUserRepository } from "../interfaces/Irepositories/IuserRepository";
import { ISubscriptionPlanService } from "../interfaces/Iserveices/IsubscriptionPlanService";
import { CreatePaymentData } from "../interfaces/models/Ipayment";
import {
  ISubscriptionPlan,
  ISubscriptionPlanResponse,
} from "../interfaces/models/IsubcriptionPlan";

@injectable()
export class SubscriptionPlanService implements ISubscriptionPlanService {
  constructor(
    @inject("ISubscriptionPlanRepository")
    private _subscriptionPlanRepository: ISubscriptionPlanRepository,
    @inject("IPaymentRepository")
    private _paymentRepository: IPaymentRepository,
    @inject("IUserRepository") private _userRepository: IUserRepository
  ) {}

  async addSubscriptionPlan(data: {
    planName: string;
    price: number;
    durationInMonths: number;
    description?: string;
  }): Promise<{
    message: string;
    success: boolean;
    data?: ISubscriptionPlan;
  }> {
    try {
      console.log(
        "entering to the subscription plan service that adds the plan"
      );
      console.log("Subscription plan data:", data);

      const existingPlan =
        await this._subscriptionPlanRepository.findByPlanName(data.planName);
      if (existingPlan) {
        return {
          message: `Subscription plan '${data.planName}' already exists`,
          success: false,
        };
      }

      const result = await this._subscriptionPlanRepository.addSubscriptionPlan(
        data
      );

      console.log("result after adding the subscription plan:", result);

      return {
        message: "Subscription plan added successfully",
        success: true,
        data: result,
      };
    } catch (error) {
      console.log("error occurred while adding the subscription plan:", error);
      return {
        message: "Error occurred while adding the subscription plan",
        success: false,
      };
    }
  }

  async getSubscriptionPlan(options: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
  }): Promise<ISubscriptionPlanResponse> {
    try {
      const page = options.page || 1;
      const limit = options.limit || 5;

      const response =
        await this._subscriptionPlanRepository.getSubscriptionPlan({
          page,
          limit,
          search: options.search,
          status: options.status,
        });

      const mappedData = response.data.map((val) => {
        return {
          _id: val._id,
          planName: val.planName,
          price: val.price,
          durationInMonths: val.durationInMonths,
          description: val.description,
          status: val.status,
          createdAt: val.createdAt,
        };
      });

      return {
        success: true,
        message: "sucefully fetched data",
        data: {
          subscriptions: mappedData,
          pagination: {
            total: response.total,
            page,
            limit,
            pages: response.pages,
            hasNextPage: response.page < response.pages,
            hasPrevPage: page > 1,
          },
        },
      };
    } catch (error) {
      console.error("Error in getAllsubscription:", error);
      return {
        success: false,
        message: "Failed to fetch subscription",
      };
    }
  }

  async showAllSubscriptionPlan(): Promise<ISubscriptionPlanResponse> {
    try {
      const response =
        await this._subscriptionPlanRepository.showAllSubscriptionPlan();

      const mappedData = response.data.map((val) => {
        return {
          _id: val._id,
          planName: val.planName,
          price: val.price,
          durationInMonths: val.durationInMonths,
          description: val.description,
          status: val.status,
          createdAt: val.createdAt,
        };
      });

      return {
        success: true,
        message: "sucefully fetched data",
        data: {
          subscriptions: mappedData,
        },
      };
    } catch (error) {
      console.error("Error in getAllsubscription:", error);
      return {
        success: false,
        message: "Failed to fetch subscription",
      };
    }
  }

  

  async purchasePlan(
    userId: String,
    planId: string
  ): Promise<{
    message: string;
    success: boolean;
    data?: {
      checkoutUrl: string;
    };
  }> {
    try {
      const subscriptionPlan =
        await this._subscriptionPlanRepository.findSubscriptionPlanById(planId);

      if (!subscriptionPlan) {
        return {
          message: "there is no plan find",
          success: false,
        };
      }

      const amountInCents = Math.round(subscriptionPlan?.price * 100);

      const getClientUrl = () => {
        switch (process.env.NODE_ENV as string) {
          case "production":
            return process.env.CLIENT_URL;
          case "development":
          default:
            return process.env.CLIENT_URL;
        }
      };

      const envvalue=getClientUrl()

      console.log("env value",envvalue)

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        mode: "payment",
        line_items: [
          {
            price_data: {
              currency: "inr",
              product_data: {
                name: `${subscriptionPlan.planName} Subscription Plan`,
                description:
                  subscriptionPlan.description ||
                  `${subscriptionPlan.planName} plan`,
              },
              unit_amount: amountInCents,
            },
            quantity: 1,
          },
        ],
        metadata: {
          planId: String(planId),
          userId: String(userId),
          planName: subscriptionPlan.planName,
          durationInMonths: subscriptionPlan.durationInMonths.toString(),
          price: subscriptionPlan.price.toString(),
        },
        success_url: `${getClientUrl()}/user/subscription?success=true&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${getClientUrl()}/user/subscription?canceled=true`,
      } as Stripe.Checkout.SessionCreateParams);

      if (!session.url) {
        return {
          success: false,
          message: "Failed to create checkout URL",
        };
      }
      return {
        success: true,
        message: "Checkout session created successfully",
        data: {
          checkoutUrl: session.url,
        },
      };
    } catch (error) {
      console.error("Error in purchaseSubscriptionPlan:", error);
      return {
        success: false,
        message: "Failed to create checkout session. Please try again.",
      };
    }
  }

  async verifyStripeSession(
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
  }> {
    try {
      console.log(
        "entered to the subscriptionplan service that verifies the stripe session"
      );
      console.log("technicianId in the subscription plan service:", userId);
      console.log("sessionId in the subscription plan service:", sessionId);

      const session = await stripe.checkout.sessions.retrieve(sessionId);

      if (!session || session.payment_status !== "paid") {
        return {
          success: false,
          message: "Payment not completed or session not found",
        };
      }

      const planId = session.metadata?.planId;
      const amount = session.metadata?.price;

      if (!planId || !userId || !amount) {
        return {
          success: false,
          message: "Invalid or missing planId, amount in the session metadata",
        };
      }

      const subscriptionPlan =
        await this._subscriptionPlanRepository.findSubscriptionPlanById(planId);

      if (!subscriptionPlan) {
        return {
          success: false,
          message: "Subscription plan not found",
        };
      }

      const paymentData: CreatePaymentData = {
        userId: userId,
        subscriptionPlanId: planId,
        amountPaid: parseInt(amount),
        paymentStatus: "Paid",
      };

      const createdPayment = await this._paymentRepository.createPayment(
        paymentData
      );

      if (!createdPayment) {
        return {
          message: "failed to complete the payment",
          success: false,
        };
      }

      await this._userRepository.updateUserPlan(userId, planId);

      const expiryDate = new Date();
      expiryDate.setMonth(
        expiryDate.getMonth() + subscriptionPlan.durationInMonths
      );

      return {
        success: true,
        message: `${subscriptionPlan.planName} plan activated successfully!`,
        data: {
          currentSubscription: {
            planName: subscriptionPlan.planName,
            status: "Active",
            durationInMonths: subscriptionPlan.durationInMonths,
            expiresAt: expiryDate.toISOString(),
            amount: parseInt(amount),
          },
        },
      };
    } catch (error) {
      console.log("error occurred while verifying the stripe session", error);
      return {
        success: false,
        message: "Failed to verify the stripe session",
      };
    }
  }
  async findOneSubscription(subscriptionId: string): Promise<{
    success: boolean;
    message: string;
    data?: {
      id: string;
      status: string;
    };
  }> {
    try {
      const subscription =
        await this._subscriptionPlanRepository.findSubscriptionById(
          subscriptionId
        );

      if (!subscription) {
        return {
          success: false,
          message: "subscription not found",
        };
      }
      const newStatus =
        subscription.status === "Active" ? "InActive" : "Active";
      console.log("subscriptionstauts", newStatus);
      const updatedSubscription =
        await this._subscriptionPlanRepository.findSubcriptionAndUpdate(
          subscriptionId,
          newStatus
        );
      console.log("updateuser", updatedSubscription);
      if (!updatedSubscription) {
        return {
          success: false,
          message: "failed to change subscription data",
        };
      }
      return {
        success: true,
        message: "subscription updated successfully",
        data: {
          id: updatedSubscription._id,
          status: updatedSubscription?.status,
        },
      };
    } catch (error) {
      console.error("error occured:", error);
      throw error;
    }
  }

  async updateSubscription(
    subscriptionId: string,
    data: ISubscriptionPlan
  ): Promise<{ success: boolean; message: string }> {
    try {
      const existingSubscription =
        await this._subscriptionPlanRepository.findSubscriptionById(
          subscriptionId
        );
      if (!existingSubscription) {
        return { success: false, message: "subscription not found" };
      }

      await this._subscriptionPlanRepository.updateSubscription(
        subscriptionId,
        data
      );

      return { success: true, message: "subscription updated successfully" };
    } catch (error: unknown) {
      const err = error as Error;
      console.error("Error in subscription service:", err.message);
      return {
        success: false,
        message: err.message || "Failed to update subscription",
      };
    }
  }
}
