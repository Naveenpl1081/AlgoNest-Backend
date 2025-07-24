import { IPasswordHash } from "../interfaces/IpasswordHash/IpasswordHash";
import  argon2 from "argon2";


export class PasswordService implements IPasswordHash{
    async hash(password: string): Promise<string> {
        return argon2.hash(password)
    }
}