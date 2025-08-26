import { injectable } from "tsyringe";
import { IUserRepository } from "../interfaces/Irepositories/IuserRepository";
import { IUser } from "../interfaces/models/Iuser";
import User from "../models/userSchema";
import { BaseRepository } from "./baseRepository";
import { FilterQuery } from "mongoose";

@injectable()
export class UserRepository
  extends BaseRepository<IUser>
  implements IUserRepository
{
  constructor() {
    super(User);
  }

  async findByEmail(email: string): Promise<IUser | null> {
    try {
      console.log("entering the userrepository");
      const userData = await this.findOne({ email });
      console.log("userData", userData);
      return userData;
    } catch (error) {
      console.error("error occurred while fetching the user", error);
      throw new Error("An error occurred while retrieving the user");
    }
  }

  async createUser(userData: Partial<IUser>): Promise<IUser> {
    try {
      const user = await this.create(userData);
      return user;
    } catch (error) {
      console.error("error occurred while creating the user", error);
      throw new Error("An error occurred while creating the user");
    }
  }
  async findById(id: string): Promise<IUser | null> {
    return await super.findById(id);
  }

  async updateUserProfile(
    id: string,
    updateData: Partial<IUser>
  ): Promise<IUser | null> {
    try {
      const updatedUser = await this.model.findByIdAndUpdate(
        id,
        { $set: updateData },
        { new: true }
      );
      return updatedUser;
    } catch (error) {
      console.error("Failed to update user profile", error);
      throw new Error("Error updating profile");
    }
  }

  async getAllUsers(options: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
  }): Promise<{
    data: IUser[];
    total: number;
    page: number;
    limit: number;
    pages: number;
  }> {
    try {
      console.log("entering the function which fetches all the users");
      const page = options.page || 1;
      const limit = options.limit || 5;

      const filter: FilterQuery<IUser> = {};

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

      console.log("filter", filter);

      const result = (await this.find(filter, {
        pagination: { page, limit },
        sort: { createdAt: -1 },
      })) as { data: IUser[]; total: number };

      console.log("data fetched from the user repository:", result);

      return {
        data: result.data,
        total: result.total,
        page,
        limit,
        pages: Math.ceil(result.total / limit),
      };
    } catch (error) {
      console.error("error occurred while fetching the users:", error);
      throw new Error("Failed to fetch the users");
    }
  }

  async findUserAndUpdate(
    userId: string,
    status: "Active" | "InActive"
  ): Promise<IUser | null> {
    try {
      const user = await User.findOneAndUpdate(
        { _id: userId },
        { $set: { status: status } },
        { new: true }
      );
      return user;
    } catch (error) {
      console.error(error);
      return null;
    }
  }
}
