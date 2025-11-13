import { Request, Response } from "express";
import { inject, injectable } from "tsyringe";
import { ICommunityService } from "../interfaces/Iserveices/IcommunityService";
import { IQuestionInput } from "../interfaces/models/Iquestion";
import { AuthenticatedRequest } from "../middleware/authMiddleware";
import { HTTP_STATUS } from "../utils/httpStatus";
import { createErrorResponse, createSuccessResponse } from "../utils/responseHelper";

@injectable()
class CommunityController {
  constructor(
    @inject("ICommunityService") private _communityService: ICommunityService
  ) {}

  async addQuestionController(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      const { title, description, tags } = req.body;
  
      if (!userId) {
        res.status(HTTP_STATUS.UNAUTHORIZED).json({ 
          success: false, 
          message: "User not authenticated" 
        });
        return;
      }
  
      if (!title || !description || !tags || !Array.isArray(tags)) {
        res.status(HTTP_STATUS.BAD_REQUEST).json({ 
          success: false, 
          message: "Missing required fields" 
        });
        return;
      }
  
    
      const questionData: IQuestionInput = {
        title,
        description,
        tags
      };
  
      const result = await this._communityService.addQuestionService(
        userId,
        questionData
      );
  
      if (result.success) {
        res.status(HTTP_STATUS.CREATED).json(result);
      } else {
        res.status(HTTP_STATUS.BAD_REQUEST).json(result);
      }
    } catch (error: any) {
      console.error("Error in addQuestionController:", error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ 
        success: false, 
        message: "Internal server error",
        error: error.message 
      });
    }
  }

  async getAllQuestionsController(req: Request, res: Response): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || undefined;
      const limit = parseInt(req.query.limit as string) || undefined;
      const search = (req.query.search as string) || undefined;
      const tags = (req.query.tags as string) || undefined;
  
      const serviceResponse = await this._communityService.getAllQuestionsService({
        page,
        limit,
        search,
        tags,
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
              serviceResponse.message || "Failed to fetch questions"
            )
          );
      }
    } catch (error: unknown) {
      console.error("Error in getAllQuestions controller:", error);
      res
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .json(createErrorResponse("Error fetching questions"));
    }
  }
  async getOneQuestion(req:Request,res:Response):Promise<void>{
    try {

      const questionId=req.params.id

      const result=await this._communityService.getOneQuestion(questionId)

      res.status(200).json(result)

      
    } catch (error) {
      console.error("Error in getAllQuestions controller:", error);
      res
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .json(createErrorResponse("Error fetching questions"));
    }
  }
}

export default CommunityController;