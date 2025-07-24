import { IUser } from "../models/Iuser";

export interface IUserRepository {
  createUser(userData: Partial<IUser>): Promise<IUser>;
  findByEmail(email: string): Promise<IUser | null>;
}
