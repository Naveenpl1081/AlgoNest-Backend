import { IUser } from "../models/Iuser";

export interface IUserRepository {
  createUser(userData: Partial<IUser>): Promise<IUser>;
  findByEmail(email: string): Promise<IUser | null>;
  findById(id: string): Promise<any | null>;
  updateUserProfile(
    id: string,
    updateData: Partial<IUser>
  ): Promise<IUser | null>;
  findAllUsers(): Promise<IUser[]>;
  findUserAndUpdate(
    userId: string,
    status: "Active" | "InActive"
  ): Promise<IUser | null>;
}
