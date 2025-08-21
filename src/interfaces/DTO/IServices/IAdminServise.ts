
import { IUser } from "../../models/Iuser";
type SortOrder = "asc" | "desc";

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

export interface GetUsersParams {
  search?: string;
  limit?: number;
  skip?: number;
  sortBy?: string;
  sortOrder?: SortOrder;
}