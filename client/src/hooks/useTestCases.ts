import { useState } from "react";
import { runTests } from "../api";
import type { TestCase, TestRunResult } from "../types";

let tcCounter = 2;

export function useTestCases() {
  const [testCases, setTestCases] = useState<TestCase[]>([
    { id: 1, input: "", expected: "" },
    { id: 2, input: "", expected: "" },
  ]);
  const [activeTestCase, setActiveTestCase] = useState(0);
  const [testResults, setTestResults] = useState<TestRunResult | null>(null);
  const [testLoading, setTestLoading] = useState(false);

  const handleRunTests = async (
    language: string,
    code: string,
    setError: (msg: string) => void,
    setActiveBottomTab: (tab: "output" | "testcases") => void,
  ) => {
    const validCases = testCases.filter(
      (tc) => tc.input.trim() !== "" || tc.expected.trim() !== "",
    );

    if (validCases.length === 0) {
      setActiveBottomTab("testcases");
      return;
    }

    setTestLoading(true);
    setTestResults(null);
    setActiveBottomTab("testcases");

    try {
      const data = await runTests({
        language,
        code,
        testCases: validCases.map((tc) => ({
          input: tc.input,
          expected: tc.expected,
        })),
      });
      setTestResults(data);
    } catch (err) {
      const e = err as { response?: { data?: { error?: string } } };
      setError(e.response?.data?.error || "Test run failed");
    } finally {
      setTestLoading(false);
    }
  };

  const addTestCase = () => {
    setTestCases((prev) => [
      ...prev,
      { id: ++tcCounter, input: "", expected: "" },
    ]);
    setActiveTestCase(testCases.length);
  };

  const removeTestCase = (idx: number) => {
    if (testCases.length === 1) return;
    setTestCases((prev) => prev.filter((_, i) => i !== idx));
    setActiveTestCase(Math.max(0, idx - 1));
  };

  const updateTestCase = (
    idx: number,
    field: "input" | "expected",
    value: string,
  ) => {
    setTestCases((prev) =>
      prev.map((tc, i) => (i === idx ? { ...tc, [field]: value } : tc)),
    );
  };

  return {
    testCases,
    activeTestCase,
    setActiveTestCase,
    testResults,
    setTestResults,
    testLoading,
    handleRunTests,
    addTestCase,
    removeTestCase,
    updateTestCase,
  };
}