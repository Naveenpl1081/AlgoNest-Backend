import { BaseRepository } from "../repository/baseRepository";
import Category from "../models/categorySchema";
import { FilterQuery, Types } from "mongoose";
import { ICategory } from "../interfaces/models/Icategory";
import { ICategoryRepository } from "../interfaces/Irepositories/IcategoryRepository";

export class CategoryRepository
  extends BaseRepository<ICategory>
  implements ICategoryRepository
{
  constructor() {
    super(Category);
  }

  async addCategory(name: string): Promise<ICategory> {
    try {
      console.log("Categorie", name);
      const newCategory = await this.create({ name });
      console.log("newCategorie", newCategory);
      return newCategory;
    } catch (error) {
      console.error("error occurred while creating the category", error);
      throw new Error("An error occurred while creating the category");
    }
  }

  async findCategoryByName(name: string): Promise<ICategory | null> {
    try {
      console.log(name);
      const existingCategory = await this.findOne({
        name: new RegExp(`^${name}$`, "i"),
      });
      console.log("exis", existingCategory);
      return existingCategory;
    } catch (error) {
      console.error("error occurred while creating the category", error);
      throw new Error("An error occurred while creating the category");
    }
  }

  async getAllCategories(): Promise<ICategory[]> {
    try {
      const allCategories = await this.findAll();
      return allCategories;
    } catch (error) {
      console.error("error occurred while creating the category", error);
      throw new Error("An error occurred while creating the category");
    }
  }
  async getAllCategoryList(options: {
    page?: number;
    limit?: number;
    search?: string;
  }): Promise<{
    data: ICategory[];
    total: number;
    page: number;
    limit: number;
    pages: number;
  }> {
    const filter: FilterQuery<ICategory> = {};

    if (options.search) {
      console.log("options.search", options.search);
      filter.$or = [
        { name: { $regex: options.search, $options: "i" } },
        { problemId: { $regex: options.search, $options: "i" } },
      ];
    }

    console.log(filter);

    const page = options.page;
    const limit = options.limit;

    if (page !== undefined && limit !== undefined) {
      const result = (await this.find(filter, {
        pagination: { page, limit },
        sort: { createdAt: -1 },
      })) as { data: ICategory[]; total: number };

      console.log("results", result);

      return {
        data: result.data,
        total: result.total,
        page,
        limit,
        pages: Math.ceil(result.total / limit),
      };
    } else {
      const allCategories = (await this.find(filter, {
        sort: { createdAt: -1 },
      })) as ICategory[];
      return {
        data: allCategories,
        total: allCategories.length,
        page: 1,
        limit: allCategories.length,
        pages: 1,
      };
    }
  }

  async findCategoryById(categoryId: string): Promise<ICategory | null> {
    try {
      if (!categoryId || categoryId.length !== 24) {
        throw new Error("Invalid category ID format");
      }

      const category = await this.findById(categoryId);
      return category;
    } catch (error) {
      console.error("Error finding Category by ID:", error);
      return null;
    }
  }

  async updateCategory(
    categoryId: string,
    data: Partial<ICategory>
  ): Promise<ICategory | null> {
    try {
      if (!categoryId || categoryId.length !== 24) {
        throw new Error("Invalid category ID format");
      }

      const { _id, ...updateData } = data;
      console.log(_id);
      const updatedCategory = await this.updateOne(
        new Types.ObjectId(categoryId),
        updateData
      );

      if (!updatedCategory) {
        return null;
      }
      return updatedCategory;
    } catch (error) {
      console.error("Error updating category:", error);
      throw new Error("An error occurred while updating the category");
    }
  }

  async findCategoryAndUpdate(
    categoryId: string,
    status: "Active" | "InActive"
  ): Promise<ICategory | null> {
    try {
      const category = await Category.findOneAndUpdate(
        { _id: categoryId },
        { $set: { status: status } },
        { new: true }
      );
      return category;
    } catch (error) {
      console.error(error);
      return null;
    }
  }
}
