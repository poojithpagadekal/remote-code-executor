import client from "./client";
import type { ExecutionResult, TestRunResult } from "../types";

export interface RunPayload {
  language: string;
  code: string;
  stdin: string;
}

export interface TestPayload {
  language: string;
  code: string;
  testCases: { input: string; expected: string }[];
}

export async function runCode(payload: RunPayload): Promise<ExecutionResult> {
  const { data } = await client.post<ExecutionResult>("/execute", payload);
  return data;
}

export async function runTests(payload: TestPayload): Promise<TestRunResult> {
  const { data } = await client.post<TestRunResult>("/execute/test", payload);
  return data;
}