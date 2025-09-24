import { IReddisPayload } from "../models/IOtp";
export interface IOTPRedis {
  setOTP(
    email: string,
    data: IReddisPayload,
    ttlSeconds: string
  ): Promise<void>;
  getOTP(email: string): Promise<IReddisPayload | null>;
  deleteOTP(email: string): Promise<void>;
  getBackupData(email: string): Promise<IReddisPayload | null>;
}
