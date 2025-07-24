import { IUser } from "../../models/Iuser";
import { ITempUser } from "../../models/ItemUser"



export interface CreateTempUserResponse {
  success: boolean;
  tempUserId: string;
}

export interface FindTempUserById {
  success: boolean;
  tempUserData?: ITempUser;
  message?: string;
}

export interface CreateUser {
  username: string;
  email: string;
  password: string;
  otp?:string;
}

export interface FindTempUserByEmail {
  success: boolean;
  tempUserData?: ITempUser;
  message?: string;
}

export interface UpdateTempUser {
  success: boolean;
  message: string;
}