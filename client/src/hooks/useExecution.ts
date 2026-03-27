import { useState } from "react";
import { runCode } from "../api";
import type { ExecutionResult, ExecutionStatus } from "../types";

export function useExecution() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ExecutionResult | null>(null);
  const [error, setError] = useState("");
  const [executionId, setExecutionId] = useState<string | null>(null);
  const [executionStatus, setExecutionStatus] =
    useState<ExecutionStatus>("idle");

  const handleRun = async (language: string, code: string, stdin: string) => {
    setLoading(true);
    setResult(null);
    setError("");
    setExecutionId(null);
    setExecutionStatus("running");

    try {
      const data = await runCode({ language, code, stdin });
      setResult(data);
      setExecutionId(data.id);
      setExecutionStatus(data.status === "success" ? "success" : "failed");
    } catch (err) {
      const e = err as { response?: { data?: { error?: string } } };
      setError(e.response?.data?.error || "Something went wrong");
      setExecutionStatus("failed");
    } finally {
      setLoading(false);
    }
  };

  const handleClearOutput = () => {
    setResult(null);
    setError("");
    setExecutionId(null);
    setExecutionStatus("idle");
  };

  return {
    loading,
    result,
    error,
    executionId,
    executionStatus,
    handleRun,
    handleClearOutput,
  };
}
