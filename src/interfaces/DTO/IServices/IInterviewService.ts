
export interface IinterviewRequestDTO {
    _id: string;
    recruiterId: string;
    candidateId: string;
    candidateName?: string;
    candidateEmail?: string;
    jobId?: string;
    jobTitle?: string;
    date: Date;
    time: string;
    duration: string;
    instructions?: string;
    roomId: string;
    status: "scheduled" | "completed" | "cancelled";
    createdAt?: Date;
    updatedAt?: Date;
  }
  
  export interface InterviewRequestResponse {
    success: boolean;
    message: string;
    data?: {
      interview: IinterviewRequestDTO[];
      pagination: {
        total: number;
        page: number;
        pages: number;
        limit: number;
        hasNextPage: boolean;
        hasPrevPage: boolean;
      };
    };
  }