import { env } from "@movie-ticket-booking/env/server";
import Redis from "ioredis";

const globalObject = global as unknown as { redisClient: any };

function createRedisClient() {
  let redis = new Redis(env.REDIS_URL, {
    connectTimeout: 10000,
  });

  redis.on("error", (err) => {
    console.error("Cache: Redis error occured:", err);
    process.exit(1)
    // throw Error("Failed to connect to redis server");
  });

  redis.on("connect", () => {
    console.log("Cache: Redis client connected successfully");
    // redis.config("SET", "maxmemory-policy", "allkeys-lru");
  });
  if (env.NODE_ENV !== "production") {
    globalObject.redisClient = redis;
  }
  return redis;
}

const redisClient = globalObject.redisClient || createRedisClient();
export default redisClient;
