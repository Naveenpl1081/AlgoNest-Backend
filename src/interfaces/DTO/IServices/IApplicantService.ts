export interface IApplicantResponse {
    id: string; 
    username: string;
    email: string;
    isVerified?: boolean;
    emailVerify?: boolean;
    status?: "Active" | "InActive" | "Pending";
    companyName?: string;
    companyType?: string;
    yearEstablished?: string;
    phone?: number;
    registrationCertificate?: string;
    createdAt?: Date;
    updatedAt?: Date;
  }
  