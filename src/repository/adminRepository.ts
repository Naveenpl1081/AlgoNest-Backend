import { injectable } from "tsyringe";
import { AdminSchema} from '../models/adminSchema'
import { IAdmin } from "../interfaces/models/Iadmin";
import { IAdminRepository } from "../interfaces/Irepositories/IadminRepository";
import User from "../models/userSchema";
import { IUser } from "../interfaces/models/Iuser";



@injectable()
export class AdminRepository implements IAdminRepository {
  async findByEmail(email: string): Promise<IAdmin | null> {
    return AdminSchema.findOne({ email });
  }
}
