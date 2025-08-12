import { container } from "tsyringe";
import { AdminService } from "../services/adminServices";
import { IAdminService } from "../interfaces/Iserveices/IadminService";
import { PasswordService } from "../services/passwordServices";
import { IPasswordHash } from "../interfaces/IpasswordHash/IpasswordHash";
import { JWTService } from "../utils/jwt";
import { IJwtService } from "../interfaces/IJwt/Ijwt";
import { IAdminRepository } from "../interfaces/Irepositories/IadminRepository";
import { AdminRepository } from "../repository/adminRepository";
import { IAdminController } from "../interfaces/Icontrollers/IadminController";
import { AdminController } from "../controllers/adminController";



container.registerSingleton<IAdminService>("IAdminService",AdminService)
container.registerSingleton<IPasswordHash>("IPasswordHash",PasswordService)
container.registerSingleton<IJwtService>("IJwtService",JWTService)
container.registerSingleton<IAdminRepository>("IAdminRepository",AdminRepository)
container.register<IAdminController>("IAdminController", { useClass: AdminController });