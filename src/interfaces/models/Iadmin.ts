export interface IAdmin extends Document {
    _id:string;
    username: string;
    email: string;
    password: string;
    role: string;
    createdAt: Date;
    updatedAt: Date;
  }

  export interface IUser {
    username: string;
    email: string;
    status: 'active' | 'inactive';
    createdAt: string;
  }
  