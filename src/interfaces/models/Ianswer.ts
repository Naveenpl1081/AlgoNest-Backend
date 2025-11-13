import mongoose, { Document, Types } from 'mongoose';

export interface ICommunityAnswer extends Document {
  _id: Types.ObjectId;
  questionId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  body: string;
  likes: mongoose.Types.ObjectId[];
  dislikes: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ILikeDislikeData {
  _id: string;
  likesCount: number;
  dislikesCount: number;
  userHasLiked: boolean;
  userHasDisliked: boolean;
}

export interface ILikeDislikeResponse {
  success: boolean;
  message: string;
  data?: ILikeDislikeData;
}