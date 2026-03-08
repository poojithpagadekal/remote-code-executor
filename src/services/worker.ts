import executionQueue from "./executionQueue";
import { executeCode } from "../executor";

const MAX_CONCURRENT_JOBS = 5;

executionQueue.process(MAX_CONCURRENT_JOBS, async (job) => {
  const { language, code } = job.data;
  const result = await executeCode(language, code);
  return result;
});

console.log(`Worker started - max ${MAX_CONCURRENT_JOBS} concurrent jobs`);
