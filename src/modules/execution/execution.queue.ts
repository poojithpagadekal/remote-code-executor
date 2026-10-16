import Bull from "bull";
import { ENV } from "../../config/env";
import { MAX_QUEUE_DEPTH } from "../../config/constants";

export interface ExecutionJob {
  language: string;
  code: string;
  stdin: string;
}

export class QueueFullError extends Error {
  constructor() {
    super("Server is busy,please try again shortly");
    this.name = "QueueFullError";
  }
}

const executionQueue = new Bull<ExecutionJob>("execution", {
  redis: ENV.REDIS_URL,
  defaultJobOptions: { removeOnComplete: true, removeOnFail: true },
});

export async function assertQueueHasRoom(jobsToAdd = 1): Promise<void> {
  const waiting = await executionQueue.getWaitingCount();
  if (waiting + jobsToAdd > MAX_QUEUE_DEPTH) {
    throw new QueueFullError();
  }
}

export default executionQueue;
