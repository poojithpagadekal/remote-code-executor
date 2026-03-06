export interface ExecutionResult {
  stdout: string;
  stderr: string;
  exitCode: number;
  status: "success" | "compile_error" | "runtime_error" | "timeout";
  executionTime: number;
}
