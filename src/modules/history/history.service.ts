import redisClient from "../../config/redis";

export interface ExecutionRecord {
  id: string;
  language: string;
  code: string;
  stdin: string;
  stdout: string;
  stderr: string;
  status: string;
  exitCode: number;
  executionTime: number;
  createdAt: string;
}

export async function saveExecution(record: ExecutionRecord): Promise<void> {
  const key = `execution:${record.id}`;
  await redisClient.set(key, JSON.stringify(record), {
    EX: 60 * 60 * 24 * 7,
  });

  await redisClient.lPush("executions:list", record.id);
  await redisClient.lTrim("executions:list", 0, 19);
}

export async function getExecution(
  id: string,
): Promise<ExecutionRecord | null> {
  const data = await redisClient.get(`execution:${id}`);
  if (!data) return null;
  return JSON.parse(data);
}

export async function getExecutions(): Promise<ExecutionRecord[]> {
  const ids = await redisClient.lRange("executions:list", 0, -1);
  if (ids.length === 0) return [];
  const records = await Promise.all(ids.map((id) => getExecution(id)));
  return records.filter((r): r is ExecutionRecord => r !== null);
}
