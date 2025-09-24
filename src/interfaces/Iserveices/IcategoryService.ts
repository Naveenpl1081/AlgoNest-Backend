import { CategoryListResponse, CategoryPaginatedResponse } from "../DTO/IServices/ICategoryService";
import { ICategory } from "../models/Icategory";


export interface ICategoryService{
     addCategory(name: string): Promise<{ success: boolean; message: string }>
     getCategories(): Promise<CategoryPaginatedResponse>
     getAllCategoryList(options: {
      page?: number 
      limit?: number 
      search?: string;
    }): Promise<CategoryListResponse>
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