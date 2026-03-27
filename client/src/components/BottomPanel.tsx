import OutputPanel from "../components/output";
import TestCasesPanel from "../components/testcases";
import type { ExecutionResult, TestCase, TestRunResult } from "../types";

interface BottomPanelProps {
  activeTab: "output" | "testcases";
  onTabChange: (tab: "output" | "testcases") => void;
  result: ExecutionResult | null;
  loading: boolean;
  error: string;
  executionId: string | null;
  onClearOutput: () => void;
  testCases: TestCase[];
  activeTestCase: number;
  testResults: TestRunResult | null;
  testLoading: boolean;
  onSetActive: (idx: number) => void;
  onAddTestCase: () => void;
  onRemoveTestCase: (idx: number) => void;
  onUpdateTestCase: (
    idx: number,
    field: "input" | "expected",
    value: string,
  ) => void;
  onRunTests: () => void;
}

const TABS = [
  { key: "output" as const, label: "Output" },
  { key: "testcases" as const, label: "Test Cases" },
];

export default function BottomPanel({
  activeTab,
  onTabChange,
  result,
  loading,
  error,
  executionId,
  onClearOutput,
  testCases,
  activeTestCase,
  testResults,
  testLoading,
  onSetActive,
  onAddTestCase,
  onRemoveTestCase,
  onUpdateTestCase,
  onRunTests,
}: BottomPanelProps) {
  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <div
        className="flex-none h-8 flex items-center"
        style={{
          backgroundColor: "#3c3f41",
          borderBottom: "1px solid #515151",
        }}
      >
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => onTabChange(tab.key)}
            className="h-full px-4 text-xs font-medium transition-all border-b-2"
            style={
              activeTab === tab.key
                ? {
                    color: "#4a9eda",
                    borderColor: "#4a9eda",
                    backgroundColor: "#2b2b2b",
                  }
                : { color: "#6d7374", borderColor: "transparent" }
            }
          >
            {tab.label}
            {tab.key === "testcases" && testResults && (
              <span
                className="ml-1.5 px-1.5 py-0.5 rounded text-[10px]"
                style={
                  testResults.failed === 0
                    ? { backgroundColor: "#62975522", color: "#629755" }
                    : { backgroundColor: "#bc3f3c22", color: "#bc3f3c" }
                }
              >
                {testResults.passed}/{testResults.total}
              </span>
            )}
          </button>
        ))}
      </div>

      {activeTab === "output" && (
        <OutputPanel
          result={result}
          loading={loading}
          error={error}
          executionId={executionId}
          onClear={onClearOutput}
        />
      )}
      {activeTab === "testcases" && (
        <TestCasesPanel
          testCases={testCases}
          activeTestCase={activeTestCase}
          testResults={testResults}
          testLoading={testLoading}
          loading={loading}
          onSetActive={onSetActive}
          onAdd={onAddTestCase}
          onRemove={onRemoveTestCase}
          onUpdate={onUpdateTestCase}
          onRunTests={onRunTests}
        />
      )}
    </div>
  );
}