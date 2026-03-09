import type { TestCase, TestRunResult } from "../types";

interface TestCasesPanelProps {
  testCases: TestCase[];
  activeTestCase: number;
  testResults: TestRunResult | null;
  testLoading: boolean;
  loading: boolean;
  onSetActive: (idx: number) => void;
  onAdd: () => void;
  onRemove: (idx: number) => void;
  onUpdate: (idx: number, field: "input" | "expected", value: string) => void;
  onRunTests: () => void;
}

export default function TestCasesPanel({
  testCases,
  activeTestCase,
  testResults,
  testLoading,
  loading,
  onSetActive,
  onAdd,
  onRemove,
  onUpdate,
  onRunTests,
}: TestCasesPanelProps) {
  const tc = testCases[activeTestCase];
  const tcResult = testResults?.results[activeTestCase];

  const taStyle = {
    backgroundColor: "#313335",
    border: "1px solid #515151",
    color: "#cdd6f4", // was #a9b7c6
    fontFamily: "'JetBrains Mono', monospace",
    outline: "none",
    resize: "none" as const,
    borderRadius: "4px",
    padding: "8px",
    fontSize: "12px",
    width: "100%",
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div
        className="flex-none flex items-center gap-1 px-3 py-1.5 flex-wrap"
        style={{
          borderBottom: "1px solid #515151",
          backgroundColor: "#313335",
        }}
      >
        {testCases.map((_, idx) => {
          const r = testResults?.results[idx];
          return (
            <button
              key={idx}
              onClick={() => onSetActive(idx)}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded text-xs transition-all"
              style={
                activeTestCase === idx
                  ? {
                      backgroundColor: "#4a9eda22",
                      color: "#4a9eda",
                      border: "1px solid #4a9eda44",
                    }
                  : { color: "#6d7374", border: "1px solid transparent" }
              }
            >
              {r && (
                <span
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ backgroundColor: r.passed ? "#629755" : "#bc3f3c" }}
                />
              )}
              Case {idx + 1}
            </button>
          );
        })}
        <button
          onClick={onAdd}
          disabled={testCases.length >= 10}
          className="px-2 py-1 rounded text-xs transition-all disabled:opacity-20"
          style={{ color: "#6d7374" }}
        >
          + Add
        </button>
      </div>

      <div className="flex-1 overflow-auto p-3 space-y-3">
        {tcResult && (
          <div
            className="rounded p-2.5 flex items-center justify-between text-xs"
            style={{
              backgroundColor: tcResult.passed ? "#62975511" : "#bc3f3c11",
              border: `1px solid ${tcResult.passed ? "#62975544" : "#bc3f3c44"}`,
            }}
          >
            <span
              style={{
                color: tcResult.passed ? "#629755" : "#bc3f3c",
                fontWeight: 600,
              }}
            >
              {tcResult.passed ? "✓ Passed" : "✗ Failed"}
            </span>
            <span style={{ color: "#6d7374" }}>
              ⚡ {tcResult.executionTime} ms
            </span>
          </div>
        )}

        <div className="space-y-1">
          <p
            className="text-[10px] uppercase tracking-widest font-medium"
            style={{ color: "#a9b7c6" }}
          >
            Input
          </p>
          <textarea
            value={tc?.input || ""}
            onChange={(e) => onUpdate(activeTestCase, "input", e.target.value)}
            placeholder="Enter test input..."
            rows={3}
            style={taStyle}
          />
        </div>

        <div className="space-y-1">
          <p
            className="text-[10px] uppercase tracking-widest font-medium"
            style={{ color: "#a9b7c6" }}
          >
            Expected Output
          </p>
          <textarea
            value={tc?.expected || ""}
            onChange={(e) =>
              onUpdate(activeTestCase, "expected", e.target.value)
            }
            placeholder="Enter expected output..."
            rows={2}
            style={taStyle}
          />
        </div>

        {tcResult && !tcResult.passed && (
          <div className="space-y-1">
            <p
              className="text-[10px] uppercase tracking-widest font-medium"
              style={{ color: "#a9b7c6" }}
            >
              Actual Output
            </p>
            <pre
              className="rounded p-2.5 text-xs whitespace-pre-wrap"
              style={{
                backgroundColor: "#2b2b2b",
                border: "1px solid #bc3f3c44",
                color: "#bc3f3c",
              }}
            >
              {tcResult.actual || "(empty)"}
            </pre>
          </div>
        )}

        {testCases.length > 1 && (
          <button
            onClick={() => onRemove(activeTestCase)}
            className="text-xs transition-colors"
            style={{ color: "#bc3f3c88" }}
          >
            Delete this case
          </button>
        )}
      </div>

      <div
        className="flex-none p-3 flex items-center justify-between"
        style={{ borderTop: "1px solid #515151", backgroundColor: "#313335" }}
      >
        {testResults ? (
          <span className="text-xs" style={{ color: "#6d7374" }}>
            <span style={{ color: "#629755" }}>
              {testResults.passed} passed
            </span>
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
    </div>
  );
}
