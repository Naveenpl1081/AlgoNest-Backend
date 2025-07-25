import "reflect-metadata";
import { container } from "tsyringe";
import { IOTPService } from "../interfaces/Iotp/IOTP";
import { OTPService } from "../services/otpServices"
import { UserRepository } from "../repository/userRepository";
import { IUserRepository } from "../interfaces/Irepositories/IuserRepository";
import { IUserService } from "../interfaces/Iserveices/IuserService";
import { UserService } from "../services/userServices";
import { IPasswordHash } from "../interfaces/IpasswordHash/IpasswordHash";
import { PasswordService } from "../services/passwordServices";
import {IEmailService} from"../interfaces/Iserveices/IEmailService"
import { EmailService } from "../services/emailService";
import { OtpRedisService } from "../services/otpRedisService";
import { IOTPRedis } from "../interfaces/Iredis/IOTPRedis";
import { JWTService } from "../utils/jwt";
import { IJwtService } from "../interfaces/IJwt/Ijwt";

container.registerSingleton<IOTPService>("IOTPService", OTPService);
container.registerSingleton<IUserRepository>("IUserRepository", UserRepository);
container.registerSingleton<IUserService>("IUserService", UserService);
container.registerSingleton<IPasswordHash>("IPasswordHash",PasswordService)
container.registerSingleton<IEmailService>("IEmailService",EmailService)
container.registerSingleton<IOTPRedis>("IOTPRedis",OtpRedisService)
container.registerSingleton<IJwtService>("IJwtService",JWTService)
