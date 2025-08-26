import "reflect-metadata";
import { container } from "tsyringe";
import { IOTPService } from "../interfaces/Iotp/IOTP";
import { IRecruiterRepository } from "../interfaces/Irepositories/IrecruiterRepository";
import { IRecruiterService } from "../interfaces/Iserveices/IrecruiterService";
import { RecruiterRepository } from "../repository/recruiterRepository";
import { OTPService } from "../services/otpServices";
import { RecruiterService } from "../services/recruiterServices";
import { IOTPRedis } from "../interfaces/Iredis/IOTPRedis";
import { OtpRedisService } from "../services/otpRedisService";
import { IPasswordHash } from "../interfaces/IpasswordHash/IpasswordHash";
import { PasswordService } from "../services/passwordServices";
import { IEmailService } from "../interfaces/Iserveices/IEmailService";
import { EmailService } from "../services/emailService";
import { IJwtService } from "../interfaces/IJwt/Ijwt";
import { JWTService } from "../utils/jwt";

container.registerSingleton<IRecruiterService>(
  "IRecruiterService",
  RecruiterService
);
container.registerSingleton<IRecruiterRepository>(
  "IRecruiterRepository",
  RecruiterRepository
);
container.registerSingleton<IOTPService>("IOTPService", OTPService);
container.registerSingleton<IPasswordHash>("IPasswordHash", PasswordService);
container.registerSingleton<IEmailService>("IEmailService", EmailService);
container.registerSingleton<IOTPRedis>("IOTPRedis", OtpRedisService);
container.registerSingleton<IJwtService>("IJwtService", JWTService);
