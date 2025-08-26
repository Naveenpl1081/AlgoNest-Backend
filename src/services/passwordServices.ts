import { IPasswordHash } from "../interfaces/IpasswordHash/IpasswordHash";
import argon2 from "argon2";

export class PasswordService implements IPasswordHash {
  async hash(password: string): Promise<string> {
    return argon2.hash(password);
  }
  async verify(hashPassword: string, plainPassword: string): Promise<boolean> {
    return argon2.verify(hashPassword, plainPassword);
  }
}
