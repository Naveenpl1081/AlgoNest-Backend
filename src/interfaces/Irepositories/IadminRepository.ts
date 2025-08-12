
import { IAdmin } from "../../interfaces/models/Iadmin"
import { IUser } from "../../interfaces/models/Iuser"
export interface IAdminRepository{
    findByEmail(email: string): Promise<IAdmin | null>
    // updateUserStatus(userId:string,status:Boolean):Promise<IUser>;
}