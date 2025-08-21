import { IUser } from "../models/Iuser";

export interface IUserRepository {
  createUser(userData: Partial<IUser>): Promise<IUser>;
  findByEmail(email: string): Promise<IUser | null>;
  findById(id: string): Promise<any | null>;
  updateUserProfile(
    id: string,
    updateData: Partial<IUser>
  ): Promise<IUser | null>;
  findUserAndUpdate(
    userId: string,
    status: "Active" | "InActive"
  ): Promise<IUser | null>;
  getAllUsers(options: {
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
  }> 
}
