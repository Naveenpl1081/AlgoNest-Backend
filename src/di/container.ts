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
container.registerSingleton<ICategoryService>("ICategoryService",CategoryService)
container.registerSingleton<ICategoryRepository>("ICategoryRepository",CategoryRepository)
container.registerSingleton<IExecuteService>("IExecuteService",ExecuteService)
container.registerSingleton<IExecuteRepository>("IExecuteRepository",ExecuteRepository)

export { container };
