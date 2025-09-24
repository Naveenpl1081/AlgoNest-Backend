export interface CategoryPaginatedResponse {
  success: boolean;
  message: string;
  data?: {
    name: string;
    status: "Active" | "InActive";
  }[];
}


export interface CategoryListResponse{
    success: boolean;
    message: string;
    data?: {
          categories: {name: string;
            status: "Active" | "InActive";}[];
          pagination: {
            total: number;
            page: number;
            pages: number;
            limit: number;
            hasNextPage: boolean;
            hasPrevPage: boolean;
          };
        }
}