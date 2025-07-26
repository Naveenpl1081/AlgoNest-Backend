
export interface IOTPRedis {
    setOTP(email: string, data: any, ttlSeconds: number): Promise<void>;
    getOTP(email: string): Promise<any | null>;
    deleteOTP(email: string): Promise<void>;
    getBackupData(email: string): Promise<any | null>;
  }
  