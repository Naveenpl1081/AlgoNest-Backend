// import PendingUser from "../models/pendingUserSchema";

// export class PendingUserRepository {
//   async create(data: { username: string; email: string; password: string }) {
//     return await new PendingUser(data).save();
//   }

//   async findByEmail(email: string) {
//     return await PendingUser.findOne({ email });
//   }

//   async deleteByEmail(email: string) {
//     return await PendingUser.deleteOne({ email });
//   }
// }