import { runPython, ExecutionResult } from "./python";

export async function executeCode(
  language: string,
  code: string,
): Promise<ExecutionResult> {
  switch (language) {
    case "python":
      return await runPython(code);
    default:
      throw new Error(`Language ${language} is not supported`);
  }
}
