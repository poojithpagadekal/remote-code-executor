import executionQueue from "./executionQueue";
import { executeCode } from "../executor/index";

const MAX_CONCURRENT_JOBS = 5;

executionQueue.process(MAX_CONCURRENT_JOBS, async (job) => {
  const { language, code, stdin } = job.data;
  const result = await executeCode(language, code, stdin);
  return result;
});

console.log(`Worker started - max ${MAX_CONCURRENT_JOBS} concurrent jobs`);
