import type { TestRunResult } from "../../types";

interface CaseFooterProps {
  testResults: TestRunResult | null;
  testLoading: boolean;
  loading: boolean;
  onRunTests: () => void;
}

export default function CaseFooter({
  testResults,
  testLoading,
  loading,
  onRunTests,
}: CaseFooterProps) {
  return (
    <div
      className="flex-none p-3 flex items-center justify-between"
      style={{ borderTop: "1px solid #515151", backgroundColor: "#313335" }}
    >
      {testResults ? (
        <span className="text-xs" style={{ color: "#6d7374" }}>
          <span style={{ color: "#629755" }}>{testResults.passed} passed</span>
          {testResults.failed > 0 && (
            <span style={{ color: "#bc3f3c" }}>
              {" "}
              · {testResults.failed} failed
            </span>
          )}
          <span> / {testResults.total} total</span>
        </span>
      ) : (
        <span className="text-xs" style={{ color: "#a9b7c6" }}>
          Add test cases to validate your code
        </span>
      )}

      <button
        onClick={onRunTests}
        disabled={testLoading || loading}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium transition-all disabled:opacity-40"
        style={{
          backgroundColor: "#4a9eda22",
          border: "1px solid #4a9eda44",
          color: "#4a9eda",
        }}
      >
        {testLoading ? (
          <span
            className="w-3 h-3 border rounded-full animate-spin"
            style={{ borderColor: "#4a9eda33", borderTopColor: "#4a9eda" }}
          />
        ) : (
          "⚡"
        )}
        Run All
      </button>
    </div>
  );
}