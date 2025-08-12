import { Model, Document, FilterQuery, UpdateQuery, SortOrder } from "mongoose";

export class BaseRepository<T extends Document> {
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
    const user = await this.model.findById(id);
    return user;
  }

}
