import { injectable } from "tsyringe";
import { IRecruiterRepository } from "../interfaces/Irepositories/IrecruiterRepository";
import { IRecruiter } from "../interfaces/models/Irecruiter";
import Recruiter from "../models/recruiterSchema";
import { BaseRepository } from "./baseRepository";

@injectable()
export class RecruiterRepository
  extends BaseRepository<IRecruiter>
  implements IRecruiterRepository
{
  constructor() {
    super(Recruiter);
  }

  async findByEmail(email: string): Promise<IRecruiter | null> {
    try {
      console.log("entering the userrepository");
      const recruiterData = await this.findOne({ email });
      console.log("userData", recruiterData);
      return recruiterData;
    } catch (error) {
      console.log("error occurred while fetching the user");
      throw new Error("An error occurred while retrieving the user");
    }
  }

  async createRecruiter(recruiterData: Partial<IRecruiter>): Promise<IRecruiter> {
    try {
      const recruiter= await this.create(recruiterData);
      return recruiter;
    } catch (error) {
      console.log("error occurred while creating the user");
      throw new Error("An error occurred while creating the user");
    }
  }
  
}
