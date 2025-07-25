import Redis from "ioredis";

const redis = new Redis({
  host: process.env.REDIS_HOST || "localhost",
  port: Number(process.env.REDIS_PORT) || 6379,
  // password: process.env.REDIS_PASSWORD, // if needed
});

redis.on("connect", () => console.log("Redis connected ✅"));
redis.on("error", (err) => console.error("Redis error ❌", err));

export default redis;
