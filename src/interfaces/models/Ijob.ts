import { Document, Types } from "mongoose";

export interface IJobPost extends Document {
  _id: string;
  jobrole: string;
  jobLocation: string;
  workTime: "full-time" | "part-time" | "contract" | "internship";
  workMode: "remote" | "on-site" | "hybrid";
  minExperience: number;
  minSalary: number;
  maxSalary: number;
  requirements: string[];
  responsibilities: string[];
  recruiterId:
    | string
    | {
        username: string;
        companyName: string;
        companyType: string;
      };
  status?: "Active" | "InActive";
  applicationsCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface IJobApplicationInput {
  name: string;
  email: string;
  contactNo: string;
  location: string;
  education: {
    highestQualification: string;
    qualificationName: string;
    institutionName: string;
    yearOfGraduation: string;
    cgpa: string;
  };
  workExperience?: {
    totalExperience?: string;
    previousJobTitles?: string;
    companyNames?: string;
  };
  skills: string[];
  links?: {
    githubProfile?: string;
    linkedinProfile?: string;
    personalWebsite?: string;
  };
  documents: {
    resume: string;
    plusTwoCertificate?: string;
    degreeCertificate?: string;
    pgCertificate?: string;
  };
  aboutYourself: string;
}


export interface IJobApplication extends Document {
  _id: string;
  jobId: Types.ObjectId;
  userId: Types.ObjectId;
  recruiterId: Types.ObjectId;
  name: string;
  email: string;
  contactNo: string;
  location: string;
  education: {
    highestQualification: string;
    qualificationName: string;
    institutionName: string;
    yearOfGraduation: string;
    cgpa: string;
  };
  workExperience?: {
    totalExperience?: string;
    previousJobTitles?: string;
    companyNames?: string;
  };
  skills: string[];
  links?: {
    githubProfile?: string;
    linkedinProfile?: string;
    personalWebsite?: string;
  };
  documents: {
    resume: string;
    plusTwoCertificate?: string;
    degreeCertificate?: string;
    pgCertificate?: string;
  };
  aboutYourself: string;
  status: "pending" | "scheduled" | "shortlisted" | "rejected" | "accepted";
  
  aiScore?: number;
  aiProcessedAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
  appliedAt: Date;
}


