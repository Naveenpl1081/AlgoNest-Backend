import { injectable, inject } from "tsyringe";
import { Request, Response } from "express";
import { HTTP_STATUS } from "../utils/httpStatus";
import {
  createErrorResponse,
  createSuccessResponse,
} from "../utils/responseHelper";
import { ICategoryService } from "../interfaces/Iserveices/IcategoryService";

@injectable()
export class CategoryController {
  constructor(
    @inject("ICategoryService") private _categoryService: ICategoryService
  ) {}

  async addCategoryController(req: Request, res: Response): Promise<void> {
    try {
      const { name } = req.body;

      const result = await this._categoryService.addCategory(name);
      if (result.success) {
        res.status(HTTP_STATUS.CREATED).json({
          success: true,
          message: result.message,
        });
      } else {
        res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: result.message,
        });
      }
    } catch (error: unknown) {
      const err = error as Error;
      console.error("Unhandled error in addCategoryController:", err.message);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: "Internal server error",
      });
    }
  }
  async getAllCategories(req: Request, res: Response): Promise<void> {
    try {
      const categories = await this._categoryService.getCategories();
      res.status(HTTP_STATUS.OK).json(categories);
    } catch (err) {
      console.error(err);
      res
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .json({ message: "Failed to fetch categories" });
    }
  }

  async categoryList(req: Request, res: Response): Promise<void> {
    try {
      const page = req.query.page
        ? parseInt(req.query.page as string)
        : undefined;
      const limit = req.query.limit
        ? parseInt(req.query.limit as string)
        : undefined;
      const search = req.query.search
        ? (req.query.search as string)
        : undefined;
      const serviceResponse = await this._categoryService.getAllCategoryList({
        page,
        limit,
        search,
      });

      if (serviceResponse.success) {
        res
          .status(HTTP_STATUS.OK)
          .json(
            createSuccessResponse(serviceResponse.data, serviceResponse.message)
          );
      } else {
        res
          .status(HTTP_STATUS.BAD_REQUEST)
          .json(
            createErrorResponse(
              serviceResponse.message || "Failed to fetch users"
            )
          );
      }
    } catch (error: unknown) {
      console.error("Error in getAllUsers controller:", error);
      res
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .json(createErrorResponse("Error fetching users"));
    }
  }

  async updateCategoryController(req: Request, res: Response): Promise<void> {
    try {
      const { categoryId } = req.params;

      const data = req.body;

      const result = await this._categoryService.updateCategory(
        categoryId,
        data
      );

      if (result.success) {
        res.status(HTTP_STATUS.OK).json({
          success: true,
          message: result.message,
        });
      } else {
        res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: result.message,
        });
      }
    } catch (error: unknown) {
      const err = error as Error;
      console.error(
        "Unhandled error in updateCategoryController:",
        err.message
      );
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  async toggleCategoryStatus(req: Request, res: Response): Promise<void> {
    try {
      const categoryId = req.params.id;

      const response = await this._categoryService.findOneCategory(categoryId);

      if (!response) {
        res.status(HTTP_STATUS.NOT_FOUND).json({
          success: false,
          message: "Category not found",
        });
        return;
      }

      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: "category status updated successfully",
        data: response,
      });
    } catch (error) {
      console.error("Error in toggleCategoryStatus:", error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: "Internal server error",
      });
    }
  }
}
