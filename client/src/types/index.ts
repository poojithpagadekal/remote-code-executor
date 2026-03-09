export interface ExecutionResult {
  id: string;
  stdout: string;
  stderr: string;
  exitCode: number;
  status: "success" | "compile_error" | "runtime_error" | "timeout";
  executionTime: number;
}

export interface TestCase {
  id: number;
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

export type ExecutionStatus = "idle" | "running" | "success" | "failed";

export const LANGUAGES = ["python", "cpp", "java"];

export const DEFAULT_CODE: Record<string, string> = {
  python: `print("Hello, World!")`,
  cpp: `#include <iostream>
int main() {
    std::cout << "Hello, World!" << std::endl;
    return 0;
}`,
  java: `public class Main {
    public static void main(String[] args) {
        System.out.println("Hello, World!");
    }
}`,
};
