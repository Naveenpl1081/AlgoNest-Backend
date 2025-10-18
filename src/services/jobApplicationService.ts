import { inject, injectable } from "tsyringe";
import { ApplicantListResponse } from "../interfaces/DTO/IServices/IJobApplicationService";
import { IJobApplicationRepository } from "../interfaces/Irepositories/IjobApplicationRepository";
import { IJobRepository } from "../interfaces/Irepositories/IjobRepository";
import { IJobApplicationService } from "../interfaces/Iserveices/IjobApplicationService";
import {
  IJobApplication,
  IJobApplicationInput,
} from "../interfaces/models/Ijob";
const pdfParse = require("pdf-parse");
import { uploadToCloudinary } from "../utils/cloudinary";
import axios from "axios";
import mammoth from "mammoth";


@injectable()
export class JobApplicationService implements IJobApplicationService {
  private groqApiKey: string;
  private groqApiUrl: string;
  constructor(
    @inject("IJobApplicationRepository")
    private _jobApplicationRepository: IJobApplicationRepository,
    @inject("IJobRepository")
    private _jobRepository: IJobRepository
  ) {
    this.groqApiKey = process.env.GROQ_API_KEY || "";
    this.groqApiUrl = process.env.GROQ_API || "";
  }

  async applyJobApplication(
    userId: string,
    jobId: string,
    data: any,
    files: { [fieldname: string]: Express.Multer.File[] }
  ): Promise<{ success: boolean; message: string; data?: any }> {
    try {
      let education, workExperience, links, skills;

      try {
        education =
          typeof data.education === "string"
            ? JSON.parse(data.education)
            : data.education;

        workExperience = data.workExperience
          ? typeof data.workExperience === "string"
            ? JSON.parse(data.workExperience)
            : data.workExperience
          : {};

        links = data.links
          ? typeof data.links === "string"
            ? JSON.parse(data.links)
            : data.links
          : {};

        skills =
          typeof data.skills === "string"
            ? JSON.parse(data.skills)
            : data.skills;
      } catch (parseError) {
        return {
          success: false,
          message: "Invalid data format. Please check your input.",
        };
      }

      if (!data.name || !data.email || !data.contactNo || !data.location) {
        return {
          success: false,
          message: "Name, email, contact number, and location are required",
        };
      }

      if (
        !education?.highestQualification ||
        !education?.qualificationName ||
        !education?.institutionName ||
        !education?.yearOfGraduation ||
        !education?.cgpa
      ) {
        return {
          success: false,
          message: "All education fields are required",
        };
      }

      if (!files?.resume || files.resume.length === 0) {
        return {
          success: false,
          message: "Resume is required",
        };
      }

      if (!skills || !Array.isArray(skills) || skills.length === 0) {
        return {
          success: false,
          message: "At least one skill is required",
        };
      }

      if (!data.aboutYourself || data.aboutYourself.length < 50) {
        return {
          success: false,
          message: "About yourself must be at least 50 characters",
        };
      }

      const jobDetails = await this._jobRepository.findJobById(jobId);
      if (!jobDetails) {
        return {
          success: false,
          message: "Job not found",
        };
      }

      const recruiterId = jobDetails.recruiterId;

      const uploadedDocuments: any = {};

      if (files.resume && files.resume[0]) {
        uploadedDocuments.resume = await uploadToCloudinary(
          files.resume[0].path
        );
      }

      if (files.plusTwoCertificate && files.plusTwoCertificate[0]) {
        uploadedDocuments.plusTwoCertificate = await uploadToCloudinary(
          files.plusTwoCertificate[0].path
        );
      }

      if (files.degreeCertificate && files.degreeCertificate[0]) {
        uploadedDocuments.degreeCertificate = await uploadToCloudinary(
          files.degreeCertificate[0].path
        );
      }

      if (files.pgCertificate && files.pgCertificate[0]) {
        uploadedDocuments.pgCertificate = await uploadToCloudinary(
          files.pgCertificate[0].path
        );
      }

      const applicationData: IJobApplicationInput = {
        name: data.name,
        email: data.email,
        contactNo: data.contactNo,
        location: data.location,
        education: education,
        workExperience: workExperience,
        skills: skills,
        links: links,
        documents: uploadedDocuments,
        aboutYourself: data.aboutYourself,
      };

      const existingApplication =
        await this._jobApplicationRepository.getOneApplication(userId, jobId);

      if (existingApplication) {
        return {
          success: false,
          message: "you already applied for this job",
        };
      }

      const result = await this._jobApplicationRepository.applyJob(
        userId,
        recruiterId as string,
        jobId,
        applicationData
      );

      return {
        success: true,
        message: "Job application submitted successfully",
        data: result,
      };
    } catch (error: unknown) {
      const err = error as Error;
      console.error("Error in applyJobApplication service:", err.message);
      return {
        success: false,
        message: err.message || "Failed to submit job application",
      };
    }
  }

  async getAllApplicants(options: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    recruiterId?: string;
  }): Promise<ApplicantListResponse> {
    try {
      console.log("Function fetching all the applicants");
      const page = options.page || 1;
      const limit = options.limit || 5;

      const result = await this._jobApplicationRepository.getAllApplicants({
        page,
        limit,
        search: options.search,
        status: options.status,
        recruiterId: options.recruiterId,
      });

      console.log("result from the applicant service:", result);

      return {
        success: true,
        message: "Applicants fetched successfully",
        data: {
          applications: result.data,
          pagination: {
            total: result.total,
            page: result.page,
            pages: result.pages,
            limit,
            hasNextPage: result.page < result.pages,
            hasPrevPage: page > 1,
          },
        },
      };
    } catch (error) {
      console.error("Error in getAllApplicants:", error);
      return {
        success: false,
        message: "Failed to fetch applicants",
      };
    }
  }

  async getAllShortlistApplicants(options: {
    page?: number;
    limit?: number;
    search?: string;
    recruiterId?: string;
  }): Promise<ApplicantListResponse> {
    try {
      console.log("Function fetching all the applicants");
      const page = options.page || 1;
      const limit = options.limit || 5;

      const result =
        await this._jobApplicationRepository.getAllShortlistApplicants({
          page,
          limit,
          search: options.search,
          recruiterId: options.recruiterId,
        });

      console.log("result from the applicant service:", result);

      return {
        success: true,
        message: "Applicants fetched successfully",
        data: {
          applications: result.data,
          pagination: {
            total: result.total,
            page: result.page,
            pages: result.pages,
            limit,
            hasNextPage: result.page < result.pages,
            hasPrevPage: page > 1,
          },
        },
      };
    } catch (error) {
      console.error("Error in getAllApplicants:", error);
      return {
        success: false,
        message: "Failed to fetch applicants",
      };
    }
  }

  async aiShortlistJob(
    jobId: string,
    recruiterId: string,
    threshold: number
  ): Promise<{ success: boolean; message: string; results?: any }> {
    try {
      const applications =
        await this._jobApplicationRepository.getFilteredApplications(
          jobId,
          recruiterId
        );

      if (!applications || applications.length === 0) {
        return {
          success: false,
          message: "No applications found for this job",
        };
      }

      const job = await this._jobRepository.findJobById(jobId);
      if (!job) {
        throw new Error("Job not found");
      }

      const results = {
        shortlisted: 0,
        rejected: 0,
        errors: 0,
        resumeParseErrors: 0,
      };

      const BATCH_SIZE = 3;
      for (let i = 0; i < applications.length; i += BATCH_SIZE) {
        const batch = applications.slice(i, i + BATCH_SIZE);

        await Promise.all(
          batch.map(async (app) => {
            try {
              const score = await this.calculateScoreWithGroq(job, app);

              if (score === 0) {
                console.warn(
                  ` Score is 0 for ${app.name} - check logs for issues`
                );
              }

              const status = score >= threshold ? "shortlisted" : "rejected";

              await this._jobApplicationRepository.updateAIShortlist(
                app._id.toString(),
                status,
                score
              );

              if (status === "shortlisted") {
                results.shortlisted++;
              } else {
                results.rejected++;
              }

              console.log(`Processed ${app.name}: ${score}% - ${status}`);
            } catch (error) {
              console.error(
                ` Error processing application ${app._id}:`,
                error
              );
              results.errors++;
            }
          })
        );

        if (i + BATCH_SIZE < applications.length) {
          await new Promise((resolve) => setTimeout(resolve, 1000));
        }
      }

      return {
        success: true,
        message: "AI shortlisting completed",
        results,
      };
    } catch (error: any) {
      console.error("AI Shortlist Job Error:", error);
      throw new Error(`AI shortlisting failed: ${error.message}`);
    }
  }

  private async extractResumeText(resumeUrl: string): Promise<string> {
    try {
      const baseUrl = process.env.CLOUDINARY_BASE_URL;
     
      const fullResumeUrl = resumeUrl.startsWith("http")
        ? resumeUrl
        : `${baseUrl}${resumeUrl}`;

      console.log(` Fetching resume from: ${fullResumeUrl}`);

      const response = await axios.get(fullResumeUrl, {
        responseType: "arraybuffer",
        timeout: 15000,
        headers: {
          "User-Agent": "ATS-Resume-Parser/1.0",
        },
      });

      console.log(" Resume fetched successfully");

      const buffer = Buffer.from(response.data);

      let fileExtension = resumeUrl.toLowerCase().split(".").pop();
      const contentType = response.headers["content-type"] || "";

      if (!fileExtension || fileExtension.length > 5) {
        if (contentType.includes("pdf")) fileExtension = "pdf";
        else if (
          contentType.includes("word") ||
          contentType.includes("document")
        )
          fileExtension = "docx";
        else fileExtension = "";
      }

      if (fileExtension === "pdf") {
        const data = await pdfParse(buffer);
        console.log(` Extracted ${data.text.length} chars from PDF`);
        return data.text;
      } else if (fileExtension === "docx" || fileExtension === "doc") {
        const result = await mammoth.extractRawText({ buffer });
        console.log(` Extracted ${result.value.length} chars from Word file`);
        return result.value;
      } else {
        console.warn(` Unsupported file format: ${fileExtension}`);
        return "";
      }
    } catch (error: any) {
      console.error(" Resume extraction error:", error.message);
      return "";
    }
  }

  private async calculateScoreWithGroq(
    job: any,
    application: IJobApplication
  ): Promise<number> {
    try {
      const resumeText = await this.extractResumeText(
        application.documents.resume
      );

      const hasValidResume = resumeText && resumeText.trim().length > 50;

      if (!hasValidResume) {
        console.warn(
          `⚠️ Resume text too short for ${application.name} (${resumeText.length} chars), using form data only`
        );
      }

      const prompt = this.buildPromptWithResume(job, application, resumeText);

      console.log(`Calling Groq API for ${application.name}...`);

      const response = await axios.post(
        this.groqApiUrl,
        {
          model: "llama-3.3-70b-versatile",
          messages: [
            {
              role: "system",
              content: `You are an expert ATS (Applicant Tracking System) that evaluates candidate-job matches.
  
  CRITICAL: You MUST respond with ONLY a single number between 0-100. Nothing else.
  
  SCORING GUIDELINES:
  - 85-100: Exceptional match - Exceeds requirements, perfect fit
  - 70-84: Strong match - Meets all key requirements
  - 55-69: Good match - Meets most requirements, minor gaps
  - 40-54: Moderate match - Some relevant skills, notable gaps
  - 25-39: Weak match - Few relevant skills, major gaps
  - 0-24: Poor match - Wrong field or insufficient qualifications
  
  Consider:
  1. Required vs optional skills match
  2. Experience level and relevance
  3. Education alignment
  4. Projects and achievements
  5. Overall profile quality
  
  RESPOND WITH ONLY THE NUMBER. Example: 75`,
            },
            {
              role: "user",
              content: prompt,
            },
          ],
          temperature: 0.1,
          max_tokens: 50,
          top_p: 0.9,
        },
        {
          headers: {
            Authorization: `Bearer ${this.groqApiKey}`,
            "Content-Type": "application/json",
          },
          timeout: 20000,
        }
      );

      if (!response.data?.choices?.[0]?.message?.content) {
        console.error("Invalid API response structure:", response.data);
        return 0;
      }

      const scoreText = response.data.choices[0].message.content.trim();
      console.log(`Raw AI response for ${application.name}: "${scoreText}"`);

      let aiScore = 0;

      const directNumber = parseInt(scoreText);
      if (!isNaN(directNumber) && directNumber >= 0 && directNumber <= 100) {
        aiScore = directNumber;
      } else {
        const matchedNumber = scoreText.match(/\b(\d+)\b/);
        if (matchedNumber) {
          aiScore = parseInt(matchedNumber[1]);
        }
      }

      if (isNaN(aiScore) || aiScore < 0 || aiScore > 100) {
        console.warn(
          `⚠️ Invalid score extracted: ${aiScore} from response: "${scoreText}"`
        );
        return 0;
      }

      console.log(` AI Score for ${application.name}: ${aiScore}`);
      return aiScore;
    } catch (error: any) {
      console.error("Groq API Error:", error.response?.data || error.message);

      const hasValidResume = await this.extractResumeText(
        application.documents.resume
      )
        .then((text) => text && text.trim().length > 50)
        .catch(() => false);

      return 0;
    }
  }

  private buildPromptWithResume(
    job: any,
    application: IJobApplication,
    resumeText: string
  ): string {
    const hasResume = resumeText && resumeText.trim().length > 50;

    const cleanedResume = resumeText
      .replace(/\s+/g, " ")
      .trim()
      .substring(0, 3500);

    return `Analyze this candidate for the job position.
  
  JOB REQUIREMENTS:
  Position: ${job.title || "N/A"}
  Required Skills: ${job.requiredSkills?.join(", ") || "Any"}
  Experience: ${job.experience || "Any level"}
  Education: ${job.qualification || "Any"}
  Description: ${job.description?.substring(0, 500) || "N/A"}
  
  CANDIDATE PROFILE:
  Name: ${application.name}
  Skills: ${application.skills?.join(", ") || "None listed"}
  Experience: ${application.workExperience?.totalExperience || "Fresher"}
  Previous Roles: ${application.workExperience?.previousJobTitles || "N/A"}
  Companies: ${application.workExperience?.companyNames || "N/A"}
  Education: ${application.education?.highestQualification || "N/A"} in ${
      application.education?.qualificationName || "N/A"
    }
  Institution: ${application.education?.institutionName || "N/A"} (${
      application.education?.yearOfGraduation || "N/A"
    })
  CGPA: ${application.education?.cgpa || "N/A"}
  About: ${application.aboutYourself?.substring(0, 300) || "N/A"}
  
  ${
    hasResume
      ? `RESUME CONTENT:\n${cleanedResume}\n${
          resumeText.length > 3500 ? "[Truncated...]" : ""
        }`
      : "Resume: Not available - score based on form data"
  }
  
  INSTRUCTIONS:
  Evaluate the complete profile considering:
  1. Skills match (required vs candidate skills)
  2. Experience relevance and depth
  3. Education alignment
  4. Projects and achievements
  5. Overall fit
  
  ${
    hasResume
      ? "Prioritize resume details."
      : "Be lenient - no resume available."
  }
  
  Respond with ONLY a number from 0-100.`;
  }

  async getApplicationDetails(
    applicationId: string
  ): Promise<{ userId: string; jobId: string }> {
    try {
      const response = await this._jobApplicationRepository.findApplication(
        applicationId
      );

      if (!response) {
        throw new Error("Application not found");
      }

      return {
        userId: response.userId.toString(),
        jobId: response.jobId.toString(),
      };
    } catch (error) {
      console.error("Error in getApplicationDetails:", error);
      throw new Error("Unable to fetch application details");
    }
  }

  async updateApplicationStatus(
    applicationId: string,
    status: string
  ): Promise<void> {
    try {
      const updated =
        await this._jobApplicationRepository.updateApplicationStatus(
          applicationId,
          status
        );
      if (!updated) {
        throw new Error("Failed to update application status");
      }
    } catch (error) {
      console.error("Error in updateApplicationStatus:", error);
      throw new Error("Unable to update application status");
    }
  }
}
