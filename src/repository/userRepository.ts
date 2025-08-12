import { injectable } from "tsyringe";
import { IUserRepository } from "../interfaces/Irepositories/IuserRepository";
import { IUser } from "../interfaces/models/Iuser";
import User from "../models/userSchema";
import { BaseRepository } from "./baseRepository";

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
      console.log("error occurred while fetching the user");
      throw new Error("An error occurred while retrieving the user");
    }
  }

  async createUser(userData: Partial<IUser>): Promise<IUser> {
    try {
      const user = await this.create(userData);
      return user;
    } catch (error) {
      console.log("error occurred while creating the user");
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

  async findAllUsers(): Promise<IUser[]> {
    try {
      console.log("Fetching all users from DB");
      const users = await User.find({}, { password: 0 }).lean();
      return users;
    } catch (error) {
      console.error("Error fetching users:", error);
      throw new Error("Failed to retrieve users from database");
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
      return null;
    }
  }
}
