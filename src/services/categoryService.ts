import { injectable, inject } from "tsyringe";
import { ICategoryRepository } from "../interfaces/Irepositories/IcategoryRepository";

import { ICategoryService } from "../interfaces/Iserveices/IcategoryService";

import { ICategory } from "../interfaces/models/Icategory";

@injectable()
export class CategoryService implements ICategoryService {
  constructor(
    @inject("ICategoryRepository")
    private _categoryRepository: ICategoryRepository
  ) {}
  async addCategory(
    name: string
  ): Promise<{ success: boolean; message: string }> {
    try {

        const existing = await this._categoryRepository.findCategoryByName(name);
        console.log("existong",existing)
        if (existing) {
          return { success: false, message: "Category already exists" };
        }
      console.log("service category", name);
      const newCategory = await this._categoryRepository.addCategory(name);
      return {
        success: true,
        message: "Category added successfully",
      };
    } catch (error: unknown) {
      const err = error as Error;
      return {
        success: false,
        message: err.message || "Failed to add category",
      };
    }
  }

  async getCategories(): Promise<{success:boolean,message:string,data?:ICategory[]}> {
    try {
        const allCategories = await this._categoryRepository.getAllCategories();
        return {
            success:true,
            message:"succefully loaded",
            data:allCategories
        }
    } catch (error) {
        const err = error as Error;
        return {
          success: false,
          message: err.message || "Failed to add category",
        };
    }
    
  }
  async getAllCategoryList(options: {
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
  }> {
    try {
      console.log("Function fetching all the users");
      const page = options.page || 1;
      const limit = options.limit || 5;
      const result = await this._categoryRepository.getAllCategoryList({
        page,
        limit,
        search: options.search
      });

      console.log("result from the problem service:", result);

      return {
        success: true,
        message: "problems fetched successfully",
        data: {
          categories: result.data,
          pagination: {
            total: result.total,
            page: result.page,
            pages: result.pages,
            limit: limit,
            hasNextPage: result.page < result.pages,
            hasPrevPage: page > 1,
          },
        },
      };
    } catch (error) {
      console.error("Error in problem:", error);
      return {
        message: "failed to create problem",
        success: false,
      };
    }
  }

  async updateCategory(categoryId: string, data: ICategory): Promise<{ success: boolean; message: string }> {
    try {
      const existingProblem = await this._categoryRepository.findCategoryById(categoryId);
      if (!existingProblem) {
        return { success: false, message: "Category not found" };
      }

      await this._categoryRepository.updateCategory(categoryId, data);

      return { success: true, message: "Category updated successfully" };
    } catch (error: unknown) {
      const err = error as Error;
      console.error("Error in updateCategory service:", err.message);
      return { success: false, message: err.message || "Failed to update category" };
    }
  }

  async findOneCategory(categoryId: string): Promise<{
    success: boolean;
    message: string;
    data?: {
      id: string;
      status: string;
    };
  }> {
    try {
      const category = await this._categoryRepository.findCategoryById(categoryId);

      if (!category) {
        return {
          success: false,
          message: "category not found",
        };
      }
      const newStatus =category.status === "Active" ? "InActive" : "Active";
      console.log("categorystauts", newStatus);
      const updatedCategory = await this._categoryRepository.findCategoryAndUpdate(
        categoryId,
        newStatus
      );
      console.log("updatedCategory", updatedCategory);
      if (!updatedCategory) {
        return {
          success: false,
          message: "failed to change category data",
        };
      }
      return {
        success: true,
        message: "category updated successfully",
        data: {
          id: updatedCategory._id,
          status: updatedCategory?.status,
        },
      };
    } catch (error) {
      console.error("error occured:", error);
      throw error;
    }
  }
}
