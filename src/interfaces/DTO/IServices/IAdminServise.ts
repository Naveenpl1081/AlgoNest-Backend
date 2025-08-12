
import { IUser } from "../../models/Iuser";

export interface AdminLoginResponse {
    success: boolean;
    message: string;
    access_token?:string
    refresh_token?:string
  }

  
export interface AdminUserListResponse {
  success: boolean;
  message: string;
  users?: IUser[];
}