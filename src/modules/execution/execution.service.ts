import { runCpp } from "./cpp";
import { runPython } from "./python";
import { runJava } from "./java";
import { ExecutionResult } from "../../types";
import { TestCase, TestCaseResult, TestRunResult } from "./execution.types";
import executionQueue from "./execution.queue";

export async function executeCode(
  language: string,
  code: string,
  stdin: string = "",
): Promise<ExecutionResult> {
  switch (language) {
    case "python":
      return await runPython(code, stdin);
    case "cpp":
      return await runCpp(code, stdin);
    case "java":
      return await runJava(code, stdin);
    default:
      throw new Error(`Language ${language} is not supported`);
  }
}

export async function runTestCases(
  language: string,
  code: string,
  testCases: TestCase[],
): Promise<TestRunResult> {
  const jobs = await Promise.all(
    testCases.map((tc) =>
      executionQueue.add({ language, code, stdin: tc.input }),
    ),
  );

  const results = await Promise.all(jobs.map((job) => job.finished()));

  const testCaseResults: TestCaseResult[] = results.map((result, index) => {
    const actual = result.stdout.trim();
    const expected = testCases[index].expected.trim();
    const passed = actual === expected && result.status === "success";

    return {
      index: index + 1,
      input: testCases[index].input,
      expected,
      actual,
      passed,
      status: result.status,
      executionTime: result.executionTime,
    };
  });

  const passed = testCaseResults.filter((r) => r.passed).length;
  return {
    results: testCaseResults,
    passed,
    failed: testCases.length - passed,
    total: testCases.length,
  };
}
