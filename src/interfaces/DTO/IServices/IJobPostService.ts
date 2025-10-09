
export interface IJobRequestDTO {
  _id?:string,
  jobrole: string;
  jobLocation: string;
  workTime: "full-time" | "part-time" | "contract" | "internship";
  workMode: "remote" | "on-site" | "hybrid";
  minExperience: number;
  minSalary: number;
  maxSalary: number;
  requirements: string[];
  responsibilities: string[];
  recruiterId?:{
    userName:string,
    companyName:string,
    companyType:string
  }
}


export interface JobRequestResponse{
  success:boolean,
  message:string,
  data?:{
    jobs:IJobRequestDTO[];
    pagination:{
      total: number;
      page: number;
      pages: number;
      limit: number;
      hasNextPage: boolean;
      hasPrevPage: boolean;
    }
  }
}

export interface UpdateJobResponseDTO{
  success:boolean,
  message:string,
  data?:IJobRequestDTO
}

export interface JobResponseDto {
  success: boolean;
  message: string;
  data?:{
    _id:string,
    status?: "Active" | "InActive" ;
  }
}


  