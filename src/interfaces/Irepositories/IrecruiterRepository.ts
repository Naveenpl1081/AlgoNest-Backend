import { IRecruiter } from "../models/Irecruiter";
import { IApplicants } from "../models/Irecruiter";
export interface IRecruiterRepository {
  createRecruiter(RecruiterData: Partial<IRecruiter>): Promise<IRecruiter>;
  findByEmail(email: string): Promise<IRecruiter | null>;
  updateRecruiterDetails(
    recruiterId: string,
    recruiterData: Partial<IRecruiter>
  ): Promise<IRecruiter | null>
  findById(id: string): Promise<IRecruiter | null>
  getAllRecruiters(options: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
  }): Promise<{
    data: IRecruiter[];
    total: number;
    page: number;
    limit: number;
    pages: number;
  }>
  findRecruiterAndUpdate(
    userId: string,
    status: "Active" | "InActive"
  ): Promise<IRecruiter | null>

  getAllApplicants(options: {
    page?: number;
    limit?: number;
  }): Promise<{
    data: IApplicants[];
    total: number;
    page: number;
    limit: number;
    pages: number;
  }>
}