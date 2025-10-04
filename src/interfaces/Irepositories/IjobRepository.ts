import { IJobRequestDTO } from "../DTO/IServices/IJobPostService"
import { IJobPost } from "../models/Ijob"

export interface IJobRepository{
    addJobs(recruiterId: string, jobData: IJobRequestDTO): Promise<IJobPost>
    getAllJobs(options: {
        recruiterId:string;
        page?: number;
        limit?: number;
        search?: string;
        status?: string;
        workmode?: string;
        worktime?:string;
      }): Promise<{
        data: IJobPost[];
        total: number;
        page: number;
        limit: number;
        pages: number;
      }>
      updateJobPost(jobId:string,data:IJobRequestDTO):Promise<IJobPost | null>
      findJobById(jobId: string): Promise<IJobPost | null> 
      getAllJobDetails(options: {
        page?: number;
        limit?: number;
        search?: string;
        status?: string;
        workmode?: string;
        worktime?: string;
      }): Promise<{
        data: IJobPost[];
        total: number;
        page: number;
        limit: number;
        pages: number;
      }>
      findJobAndUpdate(
        jobId: string,
        status: "Active" | "InActive"
      ): Promise<IJobPost | null>
}