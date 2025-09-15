import { ICategory } from "../models/Icategory";


export interface ICategoryService{
     addCategory(name: string): Promise<{ success: boolean; message: string }>
     getCategories(): Promise<{success:boolean,message:string,data?:ICategory[]}>
     getAllCategoryList(options: {
        page?: number 
        limit?: number 
        search?: string;
      }): Promise<{
        success: boolean;
        message: string;
        data?: {
              categories: ICategory[];
              pagination: {
                total: number;
                page: number;
                pages: number;
                limit: number;
                hasNextPage: boolean;
                hasPrevPage: boolean;
              };
            }
      }>
      updateCategory(categoryId: string, data: ICategory): Promise<{ success: boolean; message: string }>
      findOneCategory(categoryId: string): Promise<{
        success: boolean;
        message: string;
        data?: {
          id: string;
          status: string;
        };
      }>
}