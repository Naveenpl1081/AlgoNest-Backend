import { AdminLoginResponse } from "../DTO/IServices/IAdminServise"

export interface IAdminService{
    loginAdmin(email: string, password: string): Promise<AdminLoginResponse> 
}