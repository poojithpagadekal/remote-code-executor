export interface TestCase {
  input: string;
  expected: string;
}

export interface TestCaseResult {
  index: number;
  input: string;
  expected: string;
  actual: string;
  passed: boolean;
  status: string;
  executionTime: number;
}

export interface TestRunResult {
  results: TestCaseResult[];
  passed: number;
  failed: number;
  total: number;
}
