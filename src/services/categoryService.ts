import { injectable, inject } from "tsyringe";
import { ICategoryRepository } from "../interfaces/Irepositories/IcategoryRepository";

import { ICategoryService } from "../interfaces/Iserveices/IcategoryService";

import { ICategory } from "../interfaces/models/Icategory";
import {
  CategoryPaginatedResponse,
  CategoryListResponse,
} from "../interfaces/DTO/IServices/ICategoryService";

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
      console.log("existong", existing);
      if (existing) {
        return { success: false, message: "Category already exists" };
      }
      console.log("service category", name);
      const newCategory = await this._categoryRepository.addCategory(name);
      console.log(newCategory);
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

  async getCategories(): Promise<CategoryPaginatedResponse> {
    try {
      const allCategories = await this._categoryRepository.getAllCategories();
      return {
        success: true,
        message: "succefully loaded",
        data: allCategories,
      };
    } catch (error) {
      const err = error as Error;
      return {
        success: false,
        message: err.message || "Failed to add category",
      };
    }
  }
  async getAllCategoryList(options: {
    page?: number;
    limit?: number;
    search?: string;
  }): Promise<CategoryListResponse> {
    try {
      console.log("Function fetching all the users");
      const page = options.page;
      const limit = options.limit;
      const result = await this._categoryRepository.getAllCategoryList({
        page,
        limit,
        search: options.search,
      });

      console.log("result from the problem service:", result);
      const categories = result.data.map((cat) => ({
        name: cat.name,
        status: cat.status,
      }));

      return {
        success: true,
        message: "problems fetched successfully",
        data: {
          categories,
          pagination: {
            total: result.total,
            page: result.page,
            pages: result.pages,
            limit: result.limit,
            hasNextPage: result.page < result.pages,
            hasPrevPage: result.page > 1,
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

  async updateCategory(
    categoryId: string,
    data: ICategory
  ): Promise<{ success: boolean; message: string }> {
    try {
      const existingProblem = await this._categoryRepository.findCategoryById(
        categoryId
      );
      if (!existingProblem) {
        return { success: false, message: "Category not found" };
      }

      await this._categoryRepository.updateCategory(categoryId, data);

      return { success: true, message: "Category updated successfully" };
    } catch (error: unknown) {
      const err = error as Error;
      console.error("Error in updateCategory service:", err.message);
      return {
        success: false,
        message: err.message || "Failed to update category",
      };
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
      const category = await this._categoryRepository.findCategoryById(
        categoryId
      );

      if (!category) {
        return {
          success: false,
          message: "category not found",
        };
      }
      const newStatus = category.status === "Active" ? "InActive" : "Active";
      console.log("categorystauts", newStatus);
      const updatedCategory =
        await this._categoryRepository.findCategoryAndUpdate(
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
