import { FilterQuery } from "mongoose";
import { injectable } from "tsyringe";
import { IRecruiterRepository } from "../interfaces/Irepositories/IrecruiterRepository";
import { IRecruiter } from "../interfaces/models/Irecruiter";
import Recruiter from "../models/recruiterSchema";
import { BaseRepository } from "./baseRepository";
import { IApplicants } from "../interfaces/models/Irecruiter";

@injectable()
export class RecruiterRepository
  extends BaseRepository<IRecruiter>
  implements IRecruiterRepository
{
  constructor() {
    super(Recruiter);
  }

  async findByEmail(email: string): Promise<IRecruiter | null> {
    try {
      console.log("entering the userrepository");
      const recruiterData = await this.findOne({ email });
      console.log("userData", recruiterData);
      return recruiterData;
    } catch (error) {
      console.log("error occurred while fetching the user");
      throw new Error("An error occurred while retrieving the user");
    }
  }

  async findById(id: string): Promise<IRecruiter | null> {
    return await super.findById(id);
  }

  async createRecruiter(
    recruiterData: Partial<IRecruiter>
  ): Promise<IRecruiter> {
    try {
      const recruiter = await this.create(recruiterData);
      return recruiter;
    } catch (error) {
      console.log("error occurred while creating the user");
      throw new Error("An error occurred while creating the user");
    }
  }

  async updateRecruiterDetails(
    recruiterId: string,
    recruiterData: Partial<IRecruiter>
  ): Promise<IRecruiter | null> {
    try {
      const updatedRecruiter = await this.updateOne(
        {
          _id: recruiterId,
        },
        recruiterData
      );

      console.log("updatedRecruiter",updatedRecruiter)

      return updatedRecruiter;
    } catch (error) {
      console.error("Error occurred while updating recruiter:", error);
      throw new Error("An error occurred while updating recruiter details");
    }
  }

  async getAllRecruiters(options: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
  }): Promise<{
    data: IRecruiter[];
    total: number;
    page: number;
    limit: number;
    pages: number;
  }> {
    try {
      console.log("entering the function which fetches all the users");
      const page = options.page || 1;
      const limit = options.limit || 6;

      const filter: FilterQuery<IRecruiter> = {};
      filter.isVerified = true

      if (options.search) {
        filter.$or = [
          { username: { $regex: options.search, $options: "i" } },
          { email: { $regex: options.search, $options: "i" } },
        ];
      }

      if (options.status) {
        if (options.status === "active") {
          filter.status = "Active";
        } else if (options.status === "blocked") {
          filter.status = "InActive";
        }
      }

      console.log("filter",filter)

      const result = (await this.find(filter, {
        pagination: { page, limit },
        sort: { createdAt: -1 },
      })) as { data: IRecruiter[]; total: number };

      console.log("data fetched from the user repository:", result);

      return {
        data: result.data,
        total: result.total,
        page,
        limit,
        pages: Math.ceil(result.total / limit),
      };
    } catch (error) {
      console.log("error occurred while fetching the users:", error);
      throw new Error("Failed to fetch the users");
    }
  }
  async findRecruiterAndUpdate(
    recruiterId: string,
    status: "Active" | "InActive"
  ): Promise<IRecruiter | null> {
    try {
      const user = await Recruiter.findOneAndUpdate(
        { _id: recruiterId },
        { $set: { status: status } },
        { new: true }
      );
      return user;
    } catch (error) {
      return null;
    }
  }


  async getAllApplicants(options: {
    page?: number;
    limit?: number;
  }): Promise<{
    data: IApplicants[];
    total: number;
    page: number;
    limit: number;
    pages: number;
  }> {
    try {
      console.log("entering the function which fetches all the users");
      const page = options.page || 1;
      const limit = options.limit || 6;

      const filter: FilterQuery<IApplicants> = {};

      console.log("filter",filter)

      filter.isVerified = false;
      filter.status = "Pending";

      const result = (await this.find(filter, {
        pagination: { page, limit },
        sort: { createdAt: -1 },
      })) as { data: IApplicants[]; total: number };

      console.log("data fetched from the user repository:", result);

      return {
        data: result.data,
        total: result.total,
        page,
        limit,
        pages: Math.ceil(result.total / limit),
      };
    } catch (error) {
      console.log("error occurred while fetching the users:", error);
      throw new Error("Failed to fetch the users");
    }
  } 
}
