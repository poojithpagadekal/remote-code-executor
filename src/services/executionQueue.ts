import Bull from "bull";
import { ENV } from "../config/env";

export interface ExecutionJob {
  language: string;
  code: string;
}

const executionQueue = new Bull<ExecutionJob>("execution", {
  redis: ENV.REDIS_URL,
});

export default executionQueue;