import executionQueue from "./execution.queue";
import { executeCode } from "./execution.service";
import { MAX_CONCURRENT_JOBS } from "../../config/constants";

executionQueue.process(MAX_CONCURRENT_JOBS, async (job) => {
  const { language, code, stdin } = job.data;
  const result = await executeCode(language, code, stdin);
  return result;
});

console.log(`Worker started - max ${MAX_CONCURRENT_JOBS} concurrent jobs`);
