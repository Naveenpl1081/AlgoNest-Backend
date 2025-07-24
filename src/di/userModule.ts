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
import { ITempUserRepository } from "../interfaces/Irepositories/ITempUserRepository";
import { TempUserRepository } from "../repository/tempUserRepository";
import {IEmailService} from"../interfaces/Iserveices/IEmailService"
import { EmailService } from "../services/emailService";

container.registerSingleton<IOTPService>("IOTPService", OTPService);
container.registerSingleton<IUserRepository>("IUserRepository", UserRepository);
container.registerSingleton<IUserService>("IUserService", UserService);
container.registerSingleton<IPasswordHash>("IPasswordHash",PasswordService)
container.registerSingleton<ITempUserRepository>("ITempUserRepository",TempUserRepository)
container.registerSingleton<IEmailService>("IEmailService",EmailService)
