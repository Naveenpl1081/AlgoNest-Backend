import redis from "../redis/redisClient";
import { IOTPRedis } from "../interfaces/Iredis/IOTPRedis";
import { IReddisPayload } from "../interfaces/models/IOtp";

export class OtpRedisService implements IOTPRedis {
  private key(email: string) {
    return `otp:${email}`;
  }

  private backupKey(email: string) {
    return `otp_backup:${email}`;
  }

  async setOTP(
    email: string,
    data: IReddisPayload,
    ttlSeconds: string
  ): Promise<void> {
    await redis.set(this.key(email), JSON.stringify(data), "EX", ttlSeconds);

    const backupData = { ...data };

    await redis.set(this.backupKey(email), JSON.stringify(backupData));
  }

  async getOTP(email: string): Promise<IReddisPayload | null> {
    const value = await redis.get(this.key(email));
    return value ? JSON.parse(value) : null;
  }

  async getBackupData(email: string): Promise<IReddisPayload | null> {
    const value = await redis.get(this.backupKey(email));
    return value ? JSON.parse(value) : null;
  }

  async deleteOTP(email: string): Promise<void> {
    await redis.del(this.key(email));
    await redis.del(this.backupKey(email));
  }
}
