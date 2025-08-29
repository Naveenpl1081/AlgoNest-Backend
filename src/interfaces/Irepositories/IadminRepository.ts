import { IAdmin } from "../../interfaces/models/Iadmin";
export interface IAdminRepository {
  findByEmail(email: string): Promise<IAdmin | null>;
}
