import { createClient } from "redis";
import { ENV } from "./env";
import logger from "./logger";

const redisClient = createClient({ url: ENV.REDIS_URL });

redisClient.on("error", (err) => {
  logger.error({ error: err.message }, "Redis client error");
});

redisClient.connect().catch((err) => {
  logger.error({ error: err.message }, "Redis connection failed");
});

export default redisClient;
