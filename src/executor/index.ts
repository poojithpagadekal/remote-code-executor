import { runCpp } from "./cpp";
import { runPython } from "./python";
import { ExecutionResult } from "../types";
import { runJava } from "./java";

export async function executeCode(
  language: string,
  code: string,
  stdin: string="",
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
