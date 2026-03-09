import dotenv from "dotenv";
dotenv.config();

export const ENV = {
  PORT: process.env.PORT || "3000",
  REDIS_URL: process.env.REDIS_URL || "redis://localhost:6379",
  HOST_TEMP_PATH: process.env.HOST_TEMP_PATH || "",
  NODE_ENV: process.env.NODE_ENV || "development",
  CORS_ORIGIN: process.env.CORS_ORIGIN || "http://localhost:5173",
};
