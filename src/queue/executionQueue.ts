import Bull from "bull";
import { ExecutionResult } from "../types";

export interface ExecutionJob {
  language: string;
  code: string;
}

const executionQueue = new Bull<ExecutionJob>("execution", {
  redis: process.env.REDIS_URL || "redis://localhost:6379",
});

export default executionQueue;