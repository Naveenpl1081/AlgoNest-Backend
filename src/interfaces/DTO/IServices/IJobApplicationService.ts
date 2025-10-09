import { IJobApplication } from "../../models/Ijob";

export interface ApplicantListResponse {
    success: boolean;
    message: string;
    data?: {
      applications: IJobApplication[];
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