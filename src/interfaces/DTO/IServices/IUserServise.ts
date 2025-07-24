export interface SignupUserData {
    username: string;
    email: string;
    password: string;
    createdAt: Date;
    updatedAt: Date;
  }

  export interface TempUserResponse {
    tempUserId?: string;
    email?: string;
    success: boolean;
    message?: string;
  }

  export interface SendEmailOptions {
    to: string;
    subject: string;
    text?: string;
    html?: string;
  }