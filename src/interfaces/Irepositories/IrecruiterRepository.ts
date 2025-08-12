import { IRecruiter } from "../models/Irecruiter";

export interface IRecruiterRepository {
  createRecruiter(RecruiterData: Partial<IRecruiter>): Promise<IRecruiter>;
  findByEmail(email: string): Promise<IRecruiter | null>;
}