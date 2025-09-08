import { LoginResponse } from "../DTO/IServices/IUserServise";


export interface IAuthService{
    authLogin(code: string): Promise<LoginResponse>;
}