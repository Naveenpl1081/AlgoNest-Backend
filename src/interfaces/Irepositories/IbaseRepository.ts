import { Document, FilterQuery, UpdateQuery, SortOrder } from "mongoose";

type PopulateOption = { path: string; select?: string };

export interface IBaseRepository<T extends Document> {
  findOne(filter: FilterQuery<T>): Promise<T | null>;
  create(data: Partial<T>): Promise<T>;
  findById(id: string): Promise<T | null>;
  findAll(): Promise<T[]>; 
  find(
    filter?: FilterQuery<T>,
    options?: {
      pagination?: { page: number; limit: number };
      sort?: Record<string, SortOrder>;
      populate?: PopulateOption | PopulateOption[];
    }
  ): Promise<T[] | { data: T[]; total: number }>;
  countDocument(filter?: FilterQuery<T>): Promise<number>;
  updateOne(filter: FilterQuery<T>, update: UpdateQuery<T>): Promise<T | null>;
}
