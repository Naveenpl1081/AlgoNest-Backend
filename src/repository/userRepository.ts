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
}
