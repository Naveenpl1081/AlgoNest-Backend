import { ICategory } from "../models/Icategory";

export interface ICategoryRepository{
    addCategory(name: string): Promise<ICategory>
    findCategoryByName(name:string):Promise<ICategory | null>
    getAllCategories(): Promise<ICategory[]> 
    getAllCategoryList(options: {
        page?: number;
        limit?: number;
        search?: string;
      }): Promise<{
        data: ICategory[];
        total: number;
        page: number;
        limit: number;
        pages: number;
      }>
      findCategoryById(categoryId: string): Promise<ICategory | null>
      updateCategory(
        categoryId: string,
        data: Partial<ICategory>
      ): Promise<ICategory | null>
      findCategoryAndUpdate(
        categoryId: string,
        status: "Active" | "InActive"
      ): Promise<ICategory | null>
}