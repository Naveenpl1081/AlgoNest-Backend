import { Document } from "mongoose";

export interface ISubscriptionPlan extends Document {
  _id: string;
  planName: string;
  price: number;
  durationInMonths: number;
  description: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ISubscriptionPlanInput {
    planName: string;
    price: number;
    durationInMonths: number;
    description: string;
  }

  export interface IMappedSubscriptionPlan {
    _id: string;
    planName: string;
    price: number;
    durationInMonths: number;
    description: string;
    status: string;
    createdAt: Date;
  }

  export interface ISubscriptionPlanResponse{
    success:boolean,
    message:string,
    data?:{
        subscriptions:IMappedSubscriptionPlan[],
        pagination?:{
            total:number,
            page:number,
            limit:number,
            pages:number,
            hasNextPage:boolean,
            hasPrevPage:boolean
        }
  }
}