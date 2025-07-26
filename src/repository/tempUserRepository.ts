// import { CreateUser } from "../interfaces/DTO/IRepository/IuserRepository";
// import { ITempUserRepository } from "../interfaces/Irepositories/ITempUserRepository";
// import { ITempUser } from "../interfaces/models/ItemUser";
// import { IUser } from "../interfaces/models/Iuser";

// import PendingUser from "../models/pendingUserSchema";
// import { BaseRepository } from "./baseRepository";

// export class TempUserRepository 
// extends BaseRepository<ITempUser>
// implements ITempUserRepository{

//     constructor(){
//         super(PendingUser)
//     }
//    async createUser(userData: CreateUser): Promise<ITempUser> {
//         const data=await this.create(userData)
//         return data
//     }

//     async findByOtp(otp: string): Promise<ITempUser | null> {
//         const data =await this.findOne({ otp });
//         console.log("data",data)
//         return data
//       }
// }