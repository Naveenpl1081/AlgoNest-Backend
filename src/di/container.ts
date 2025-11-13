import "reflect-metadata";
import { container } from "tsyringe";
import { IOTPService } from "../interfaces/Iotp/IOTP";
import { OTPService } from "../services/otpServices";
import { UserRepository } from "../repository/userRepository";
import { IUserRepository } from "../interfaces/Irepositories/IuserRepository";
import { IUserService } from "../interfaces/Iserveices/IuserService";
import { UserService } from "../services/userServices";
import { IPasswordHash } from "../interfaces/IpasswordHash/IpasswordHash";
import { PasswordService } from "../services/passwordServices";
import { IEmailService } from "../interfaces/Iserveices/IEmailService";
import { EmailService } from "../services/emailService";
import { OtpRedisService } from "../services/otpRedisService";
import { IOTPRedis } from "../interfaces/Iredis/IOTPRedis";
import { JWTService } from "../utils/jwt";
import { IJwtService } from "../interfaces/IJwt/Ijwt";
import { AuthMiddleware } from "../middleware/authMiddleware";
import { IAuthService } from "../interfaces/Iserveices/IauthService";
import { GitHubService } from "../services/gitHubService";
import { LinkedInService } from "../services/linkedinService";
import { IRecruiterService } from "../interfaces/Iserveices/IrecruiterService";
import { RecruiterService } from "../services/recruiterServices";
import { IRecruiterRepository } from "../interfaces/Irepositories/IrecruiterRepository";
import { RecruiterRepository } from "../repository/recruiterRepository";
import { IAdminRepository } from "../interfaces/Irepositories/IadminRepository";
import { AdminRepository } from "../repository/adminRepository";
import { IAdminService } from "../interfaces/Iserveices/IadminService";
import { AdminService } from "../services/adminServices";
import { ProblemRepository } from "../repository/problemRepository";
import { IProblemRepository } from "../interfaces/Irepositories/IproblemRepository";
import { IProblemService } from "../interfaces/Iserveices/IproblemService";
import { ProblemService } from "../services/problemService";
import { ICategoryService } from "../interfaces/Iserveices/IcategoryService";
import { CategoryService } from "../services/categoryService";
import { ICategoryRepository } from "../interfaces/Irepositories/IcategoryRepository";
import { CategoryRepository } from "../repository/categoryRepository";
import { IExecuteService } from "../interfaces/Iserveices/IexecuteService";
import { ExecuteService } from "../services/executeService";
import { IExecuteRepository } from "../interfaces/Irepositories/IexecuteRepository";
import { ExecuteRepository } from "../repository/executeRepository";
import { IOutputParser } from "../interfaces/Iexecute/IOutputPareser";
import { OutputParser } from "../utils/outputParser";
import { ICodeWrapper } from "../interfaces/Iexecute/ICodeWrapper";
import { CodeWrapper } from "../utils/codeWrapper";
import { ITestExecutor } from "../interfaces/Iexecute/ITestExecutor";
import { TestExecutor } from "../utils/testExecutor";
import { AIService } from "../services/aiServices";
import { IAIService } from "../interfaces/Iserveices/IaiService";
import { IAIRepository } from "../interfaces/Irepositories/IaiRepository";
import { AIRepository } from "../repository/aiRepository";
import { IJobRepository } from "../interfaces/Irepositories/IjobRepository";
import { JobRepository } from "../repository/jobRepository";
import { IJobService } from "../interfaces/Iserveices/IjobService";
import { JobService } from "../services/jobService";
import { IAITutorRepository } from "../interfaces/Irepositories/IaiTutorRepository";
import { AITutorRepository } from "../repository/AiTutorRepository";
import { IAITutorService } from "../interfaces/Iserveices/IaiTutorService";
import { AITutorService } from "../services/AiTutorService";
import { IJobApplicationRepository } from "../interfaces/Irepositories/IjobApplicationRepository";

import { IJobApplicationService } from "../interfaces/Iserveices/IjobApplicationService";
import { JobApplicationService } from "../services/jobApplicationService";
import { JobApplicationRepository } from "../repository/jobApplicationRepository";
import { IInterviewSerivce } from "../interfaces/Iserveices/IinterviewService";
import { InterviewService } from "../services/interviewService";
import { IInterviewRepository } from "../interfaces/Irepositories/IinterviewRepository";
import { InterviewRepository } from "../repository/interviewRepository";
import { ICommunityRepository } from "../interfaces/Irepositories/IcommunityRepository";
import { CommunityRepository } from "../repository/communityRepository";
import { ICommunityService } from "../interfaces/Iserveices/IcommunityService";
import { CommunityService } from "../services/communityService";
import { IAnswerRepository } from "../interfaces/Irepositories/IanswerRepository";
import { AnswerRepository } from "../repository/answerRepository";
import { IAnswerService } from "../interfaces/Iserveices/IanswerService";
import { AnswerService } from "../services/answerService";
import { ISubscriptionPlanRepository } from "../interfaces/Irepositories/IsubscriptionPlanRepository";
import { SubscriptionPlanRepository } from "../repository/subscriptionPlanRepository";
import { ISubscriptionPlanService } from "../interfaces/Iserveices/IsubscriptionPlanService";
import { SubscriptionPlanService } from "../services/subscriptionPlanService";
import { IPaymentRepository } from "../interfaces/Irepositories/IpaymentRepository";
import { PaymentRepository } from "../repository/paymentRepository";

container.registerSingleton<IOTPService>("IOTPService", OTPService);
container.registerSingleton<IUserRepository>("IUserRepository", UserRepository);
container.registerSingleton<IUserService>("IUserService", UserService);
container.registerSingleton<IPasswordHash>("IPasswordHash", PasswordService);
container.registerSingleton<IEmailService>("IEmailService", EmailService);
container.registerSingleton<IOTPRedis>("IOTPRedis", OtpRedisService);
container.registerSingleton<IJwtService>("IJwtService", JWTService);
container.registerSingleton<AuthMiddleware>("AuthMiddleware", AuthMiddleware);
container.registerSingleton<IAuthService>("GitHubService", GitHubService);
container.registerSingleton<IAuthService>("LinkedInService", LinkedInService);
container.registerSingleton<IRecruiterService>(
  "IRecruiterService",
  RecruiterService
);
container.registerSingleton<IRecruiterRepository>(
  "IRecruiterRepository",
  RecruiterRepository
);
container.registerSingleton<IAdminRepository>(
  "IAdminRepository",
  AdminRepository
);
container.registerSingleton<IAdminService>("IAdminService", AdminService);
container.registerSingleton<IProblemRepository>(
  "IProblemRepository",
  ProblemRepository
);
container.registerSingleton<IProblemService>("IProblemService", ProblemService);
container.registerSingleton<ICategoryService>(
  "ICategoryService",
  CategoryService
);
container.registerSingleton<ICategoryRepository>(
  "ICategoryRepository",
  CategoryRepository
);
container.registerSingleton<IExecuteService>("IExecuteService", ExecuteService);
container.registerSingleton<IExecuteRepository>(
  "IExecuteRepository",
  ExecuteRepository
);
container.registerSingleton<IOutputParser>("IOutputParser", OutputParser);
container.registerSingleton<ICodeWrapper>("ICodeWrapper", CodeWrapper);
container.registerSingleton<ITestExecutor>("ITestExecutor", TestExecutor);
container.registerSingleton<IAIService>("IAIService", AIService);
container.registerSingleton<IAIRepository>("IAIRepository", AIRepository);
container.registerSingleton<IJobRepository>("IJobRepository", JobRepository);
container.registerSingleton<IJobService>("IJobService", JobService);
container.registerSingleton<IAITutorRepository>(
  "IAITutorRepository",
  AITutorRepository
);
container.registerSingleton<IAITutorService>("IAITutorService", AITutorService);
container.registerSingleton<IJobApplicationRepository>(
  "IJobApplicationRepository",
  JobApplicationRepository
);
container.registerSingleton<IJobApplicationService>(
  "IJobApplicationService",
  JobApplicationService
);
container.registerSingleton<IInterviewSerivce>(
  "IInterviewSerivce",
  InterviewService
);
container.registerSingleton<IInterviewRepository>(
  "IInterviewRepository",
  InterviewRepository
);

container.registerSingleton<ICommunityRepository>(
  "ICommunityRepository",
  CommunityRepository
);
container.registerSingleton<ICommunityService>(
  "ICommunityService",
  CommunityService
);
container.registerSingleton<IAnswerRepository>(
  "IAnswerRepository",
  AnswerRepository
);
container.registerSingleton<IAnswerService>("IAnswerService", AnswerService);
container.registerSingleton<ISubscriptionPlanRepository>(
  "ISubscriptionPlanRepository",
  SubscriptionPlanRepository
);
container.registerSingleton<ISubscriptionPlanService>(
  "ISubscriptionPlanService",
  SubscriptionPlanService
);
container.registerSingleton<IPaymentRepository>(
  "IPaymentRepository",
  PaymentRepository
);
export { container };
