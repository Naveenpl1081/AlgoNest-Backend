import { Request, Response } from "express";

import {
  createErrorResponse,
  createSuccessResponse,
} from "../utils/responseHelper";
import { inject, injectable } from "tsyringe";
import { HTTP_STATUS } from "../utils/httpStatus";
import { ISubscriptionPlanService } from "../interfaces/Iserveices/IsubscriptionPlanService";
import { ISubscriptionPlanInput } from "../interfaces/models/IsubcriptionPlan";
import { AuthenticatedRequest } from "../middleware/authMiddleware";

@injectable()
export class SubscriptionPlanController {
  constructor(
    @inject("ISubscriptionPlanService")
    private _subscriptionPlanService: ISubscriptionPlanService
  ) {}

  async addSubscriptionPlan(req: Request, res: Response): Promise<void> {
    try {
      console.log("entering to the function adding the subscription plan");
      console.log("Received Data:", req.body);

      const { planName, price, durationInMonths, description } = req.body;

      const subscriptionPlanData: ISubscriptionPlanInput = {
        planName,
        price,
        durationInMonths,
        description,
      };

      console.log("Processed subscription plan data:", subscriptionPlanData);

      const serviceResponse =
        await this._subscriptionPlanService.addSubscriptionPlan(
          subscriptionPlanData
        );

      console.log("Service response:", serviceResponse);

      if (serviceResponse.success) {
        res
          .status(HTTP_STATUS.CREATED)
          .json(
            createSuccessResponse(serviceResponse.data, serviceResponse.message)
          );
      } else {
        res
          .status(HTTP_STATUS.BAD_REQUEST)
          .json(
            createErrorResponse(
              serviceResponse.message || "Failed to add subscription plan"
            )
          );
      }
    } catch (error) {
      console.log("error occurred while adding the subscription plan:", error);
      res
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .json(createErrorResponse("Internal Server Error"));
    }
  }

  async getAllSubscriptions(req: Request, res: Response): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || undefined;
      const limit = parseInt(req.query.limit as string) || undefined;
      const search = (req.query.search as string) || undefined;
      const status = (req.query.status as string) || undefined;

      console.log("sear", search);

      const serviceResponse =
        await this._subscriptionPlanService.getSubscriptionPlan({
          page,
          limit,
          search,
          status,
        });

      if (serviceResponse.success) {
        res
          .status(HTTP_STATUS.OK)
          .json(
            createSuccessResponse(serviceResponse.data, serviceResponse.message)
          );
      } else {
        res
          .status(HTTP_STATUS.BAD_REQUEST)
          .json(
            createErrorResponse(
              serviceResponse.message || "Failed to fetch subscription"
            )
          );
      }
    } catch (error) {
      console.error("Error in subscription controller:", error);
      res
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .json(createErrorResponse("Error fetching subscription"));
    }
  }

  async showAllSubscriptions(req: Request, res: Response): Promise<void> {
    try {
      const serviceResponse =
        await this._subscriptionPlanService.showAllSubscriptionPlan();

      if (serviceResponse.success) {
        res
          .status(HTTP_STATUS.OK)
          .json(
            createSuccessResponse(serviceResponse.data, serviceResponse.message)
          );
      } else {
        res
          .status(HTTP_STATUS.BAD_REQUEST)
          .json(
            createErrorResponse(
              serviceResponse.message || "Failed to fetch subscription"
            )
          );
      }
    } catch (error) {
      console.error("Error in subscription controller:", error);
      res
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .json(createErrorResponse("Error fetching subscription"));
    }
  }

  async purchaseSubscriptionPlan(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> {
    try {
      console.log(
        "entered to the user controller that purchases the subsciption plan"
      );
      const userId = req.user?.id;
      const { planId } = req.body;

      if (!userId) {
        res
          .status(HTTP_STATUS.UNAUTHORIZED)
          .json(createErrorResponse("user ID is required"));
        return;
      }
      const serviceResponse = await this._subscriptionPlanService.purchasePlan(
        userId,
        planId
      );

      console.log(
        "service response in the purchase subscription plan controller:",
        serviceResponse
      );

      if (serviceResponse.success) {
        res
          .status(HTTP_STATUS.OK)
          .json(
            createSuccessResponse(
              serviceResponse.data,
              serviceResponse.message || "Checkout session created successfully"
            )
          );
      } else {
        res
          .status(HTTP_STATUS.BAD_REQUEST)
          .json(
            createErrorResponse(
              serviceResponse.message || "Failed to create checkout session"
            )
          );
      }
    } catch (error) {
      console.log(
        "error occured while purchasing the subscription plan:",
        error
      );
      res
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .json(createErrorResponse("Internal Server Error"));
    }
  }

  async verifyStripeSession(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> {
    try {
      const sessionId = req.params.sessionId as string;
      const userId = req.user?.id;
      console.log(
        "userId in the stripe verify function in technician controller:",
        userId
      );
      console.log(
        "sessionId in the stripe verify function technician controller:",
        sessionId
      );

      if (!userId) {
        res
          .status(HTTP_STATUS.UNAUTHORIZED)
          .json(createErrorResponse("user not authenticated"));
        return;
      }

      const serviceResponse =
        await this._subscriptionPlanService.verifyStripeSession(
          userId,
          sessionId
        );

      console.log(
        "result from the verifying stripe session in technician controller:",
        serviceResponse
      );

      if (serviceResponse.success) {
        res
          .status(HTTP_STATUS.OK)
          .json(
            createSuccessResponse(serviceResponse.data, serviceResponse.message)
          );
      } else {
        const statusCode = serviceResponse.message?.includes("not found")
          ? HTTP_STATUS.NOT_FOUND
          : serviceResponse.message?.includes("not completed")
          ? HTTP_STATUS.NOT_COMPLETED
          : HTTP_STATUS.BAD_REQUEST;
        res
          .status(statusCode)
          .json(
            createErrorResponse(
              serviceResponse.message || "Failed to verify payment"
            )
          );
      }
    } catch (error) {
      console.log("error occurred while verifying the stripe session:", error);
      res
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .json(createErrorResponse("Internal Server Error"));
    }
  }
  async toggleSubscriptionStatus(req: Request, res: Response): Promise<void> {
    try {
      const subscriptionId = req.params.id;
      console.log("subscriptionId,", subscriptionId);
      const response = await this._subscriptionPlanService.findOneSubscription(
        subscriptionId
      );

      if (!response) {
        res.status(HTTP_STATUS.NOT_FOUND).json({
          success: false,
          message: "subscription not found",
        });
        return;
      }

      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: "subscription status updated successfully",
        data: response,
      });
    } catch (error) {
      console.error("Error in togglesubscriptionStatus:", error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  async updateSubscriptionController(req: Request, res: Response): Promise<void> {
    try {
      const { subscriptionId } = req.params;

      const data = req.body;

      const result = await this._subscriptionPlanService.updateSubscription(
        subscriptionId,
        data
      );

      if (result.success) {
        res.status(HTTP_STATUS.OK).json({
          success: true,
          message: result.message,
        });
      } else {
        res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: result.message,
        });
      }
    } catch (error: unknown) {
      const err = error as Error;
      console.error(
        "Unhandled error in updateSubscriptionController:",
        err.message
      );
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: "Internal server error",
      });
    }
  }
}
