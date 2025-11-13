import {
  Model,
  Document,
  FilterQuery,
  UpdateQuery,
  SortOrder,
  Types,
} from "mongoose";
import { IBaseRepository } from "../interfaces/Irepositories/IbaseRepository";
import { ICategory } from "../interfaces/models/Icategory";
type PopulateOption = { path: string; select?: string };

export class BaseRepository<T extends Document> implements IBaseRepository<T> {
  protected model: Model<T>;

  constructor(model: Model<T>) {
    this.model = model;
  }

  async findOne(filter: FilterQuery<T>): Promise<T | null> {
    const user = this.model.findOne(filter);
    return user;
  }

  async create(data: Partial<T>) {
    const createDoc = await this.model.create(data);
    return await createDoc.save();
  }
  async findById(id: string): Promise<T | null> {
    console.log(id);
    const user = await this.model.findById(id);
    console.log(user);
    return user;
  }

  async findAll(): Promise<T[]> {
    return this.model.find({ status: "Active" });
  }

  async find(
    filter: FilterQuery<T> = {},
    options?: {
      pagination?: { page: number; limit: number };
      sort?: Record<string, SortOrder>;
      populate?: PopulateOption | PopulateOption[];
    }
  ): Promise<T[] | { data: T[]; total: number }> {
    let query = this.model.find(filter);

    if (options?.sort) {
      query = query.sort(options.sort);
    }

    if (options?.populate) {
      query = query.populate(options.populate);
    }

    if (options?.pagination) {
      const { page, limit } = options.pagination;
      const skip = (page - 1) * limit;

      query = query.skip(skip).limit(limit);

      const data = await query.exec();

      const total = await this.countDocument(filter);

      return {
        data,
        total,
      };
    }
    return await query.exec();
  }

  async countDocument(filter: FilterQuery<T> = {}): Promise<number> {
    return await this.model.countDocuments(filter).exec();
  }

  async updateOne(
    filter: FilterQuery<T>,
    update: UpdateQuery<T>
  ): Promise<T | null> {
    return await this.model.findByIdAndUpdate(filter, update, { new: true });
  }

  async addLike(answerId: string, userId: string): Promise<T | null> {
    return await this.model.findByIdAndUpdate(
      answerId,
      {
        $addToSet: { likes: new Types.ObjectId(userId) },
        $pull: { dislikes: new Types.ObjectId(userId) },
      },
      { new: true }
    );
  }

  async removeLike(answerId: string, userId: string): Promise<T | null> {
    return await this.model.findByIdAndUpdate(
      answerId,
      { $pull: { likes: new Types.ObjectId(userId) } },
      { new: true }
    );
  }

  async addDislike(answerId: string, userId: string): Promise<T | null> {
    return await this.model.findByIdAndUpdate(
      answerId,
      {
        $addToSet: { dislikes: new Types.ObjectId(userId) },
        $pull: { likes: new Types.ObjectId(userId) },
      },
      { new: true }
    );
  }

  async removeDislike(answerId: string, userId: string): Promise<T | null> {
    return await this.model.findByIdAndUpdate(
      answerId,
      { $pull: { dislikes: new Types.ObjectId(userId) } },
      { new: true }
    );
  }

  


}
