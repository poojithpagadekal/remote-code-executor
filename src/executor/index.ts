import { runCpp } from "./cpp";
import { runPython } from "./python";
import { ExecutionResult } from "../types";

export async function executeCode(
  language: string,
  code: string,
): Promise<ExecutionResult> {
  switch (language) {
    case "python":
      return await runPython(code);
    case "cpp":
      return await runCpp(code);
    default:
      throw new Error(`Language ${language} is not supported`);
  }
}
