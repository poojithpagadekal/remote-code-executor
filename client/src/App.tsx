import { Routes, Route } from "react-router-dom";
import { useState, useRef, useCallback } from "react";
import axios from "axios";
import SharePage from "./pages/SharePage";
import Header from "./components/Header";
import EditorPanel from "./components/EditorPanel";
import OutputPanel from "./components/OutputPanel";
import TestCasesPanel from "./components/TestCasePanel";
import { DEFAULT_CODE } from "./types";
import type {
  ExecutionResult,
  TestCase,
  TestRunResult,
  ExecutionStatus,
} from "./types";

let tcCounter = 2;

function MainLayout() {
  const [language, setLanguage] = useState("python");
  const [code, setCode] = useState(DEFAULT_CODE["python"]);
  const [codeMap, setCodeMap] = useState<Record<string, string>>({
    ...DEFAULT_CODE,
  });
  const [stdin, setStdin] = useState("");
  const [result, setResult] = useState<ExecutionResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [testLoading, setTestLoading] = useState(false);
  const [error, setError] = useState("");
  const [executionId, setExecutionId] = useState<string | null>(null);
  const [executionStatus, setExecutionStatus] =
    useState<ExecutionStatus>("idle");
  const [activeBottomTab, setActiveBottomTab] = useState<
    "output" | "testcases"
  >("output");
  const [testCases, setTestCases] = useState<TestCase[]>([
    { id: 1, input: "", expected: "" },
    { id: 2, input: "", expected: "" },
  ]);
  const [activeTestCase, setActiveTestCase] = useState(0);
  const [testResults, setTestResults] = useState<TestRunResult | null>(null);
  const [stdinCollapsed, setStdinCollapsed] = useState(false);
  const [stdinHeightPct, setStdinHeightPct] = useState(0.35);
  const rightPanelRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);

  const handleLanguageChange = (lang: string) => {
    setCodeMap((prev) => ({ ...prev, [language]: code }));
    setLanguage(lang);
    setCode(codeMap[lang]);
    setResult(null);
    setError("");
    setExecutionId(null);
    setTestResults(null);
    setExecutionStatus("idle");
  };

  const handleRun = async () => {
    setLoading(true);
    setResult(null);
    setError("");
    setExecutionId(null);
    setExecutionStatus("running");
    setActiveBottomTab("output");
    try {
      const response = await axios.post("http://localhost:3000/api/execute", {
        language,
        code,
        stdin,
      });
      setResult(response.data);
      setExecutionId(response.data.id);
      setExecutionStatus(
        response.data.status === "success" ? "success" : "failed",
      );
    } catch (err) {
      const e = err as { response?: { data?: { error?: string } } };
      setError(e.response?.data?.error || "Something went wrong");
      setExecutionStatus("failed");
    } finally {
      setLoading(false);
    }
  };

  const handleRunTests = async () => {
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
      const response = await axios.post(
        "http://localhost:3000/api/execute/test",
        {
          language,
          code,
          testCases: validCases.map((tc) => ({
            input: tc.input,
            expected: tc.expected,
          })),
        },
      );
      setTestResults(response.data);
    } catch (err) {
      const e = err as { response?: { data?: { error?: string } } };
      setError(e.response?.data?.error || "Test run failed");
    } finally {
      setTestLoading(false);
    }
  };

  const handleClearOutput = () => {
    setResult(null);
    setError("");
    setExecutionId(null);
    setExecutionStatus("idle");
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

  const onDragStart = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    isDragging.current = true;

    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging.current || !rightPanelRef.current) return;
      const rect = rightPanelRef.current.getBoundingClientRect();
      const pct = (e.clientY - rect.top) / rect.height;
      setStdinHeightPct(Math.min(0.7, Math.max(0.15, pct)));
    };

    const onMouseUp = () => {
      isDragging.current = false;
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
  }, []);

  const TABS = [
    { key: "output" as const, label: "Output" },
    { key: "testcases" as const, label: "Test Cases" },
  ];

  return (
    <div
      className="h-screen flex flex-col overflow-hidden"
      style={{
        backgroundColor: "#2b2b2b",
        fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
      }}
    >
      <Header
        language={language}
        loading={loading}
        testLoading={testLoading}
        executionStatus={executionStatus}
        onLanguageChange={handleLanguageChange}
        onRun={handleRun}
        onRunTests={handleRunTests}
      />

      <div className="flex flex-1 overflow-hidden">
        <EditorPanel language={language} code={code} onChange={setCode} />

        <div
          ref={rightPanelRef}
          className="flex flex-col flex-1 overflow-hidden"
        >
          {!stdinCollapsed && (
            <div
              className="flex-none flex flex-col overflow-hidden"
              style={{
                height: `${stdinHeightPct * 100}%`,
                borderBottom: "1px solid #515151",
              }}
            >
              <div
                className="flex-none h-8 flex items-center px-3 gap-2"
                style={{
                  backgroundColor: "#3c3f41",
                  borderBottom: "1px solid #515151",
                }}
              >
                <span
                  className="text-xs font-medium"
                  style={{ color: "#cdd6f4" }}
                >
                  stdin
                </span>
                <span className="text-[10px]" style={{ color: "#6d7374" }}>
                  — passed to program on Run
                </span>
                <div className="flex-1" />
                <button
                  onClick={() => setStdinCollapsed(true)}
                  className="text-[10px] px-1.5 py-0.5 rounded transition-colors"
                  style={{ color: "#6d7374" }}
                  title="Collapse stdin"
                >
                  ✕
                </button>
              </div>
              <textarea
                value={stdin}
                onChange={(e) => setStdin(e.target.value)}
                placeholder="Enter program input here..."
                className="flex-1 resize-none outline-none px-3 py-2 text-xs overflow-auto"
                style={{
                  backgroundColor: "#2b2b2b",
                  color: "#cdd6f4",
                  fontFamily: "'JetBrains Mono', monospace",
                }}
              />
            </div>
          )}

          {!stdinCollapsed ? (
            <div
              onMouseDown={onDragStart}
              className="flex-none flex items-center justify-center cursor-row-resize select-none"
              style={{ height: "6px", backgroundColor: "#1e1f22" }}
            >
              <div
                className="rounded-full"
                style={{
                  width: "32px",
                  height: "2px",
                  backgroundColor: "#515151",
                }}
              />
            </div>
          ) : (
            <div
              className="flex-none flex items-center px-3 gap-2"
              style={{
                height: "28px",
                backgroundColor: "#3c3f41",
                borderBottom: "1px solid #515151",
              }}
            >
              <span className="text-xs" style={{ color: "#6d7374" }}>
                stdin
              </span>
              <button
                onClick={() => setStdinCollapsed(false)}
                className="text-[10px] px-2 py-0.5 rounded transition-colors"
                style={{
                  color: "#4a9eda",
                  border: "1px solid #4a9eda44",
                  backgroundColor: "#4a9eda11",
                }}
              >
                Open
              </button>
            </div>
          )}

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
                  onClick={() => setActiveBottomTab(tab.key)}
                  className="h-full px-4 text-xs font-medium transition-all border-b-2"
                  style={
                    activeBottomTab === tab.key
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

            {activeBottomTab === "output" && (
              <OutputPanel
                result={result}
                loading={loading}
                error={error}
                executionId={executionId}
                onClear={handleClearOutput}
              />
            )}
            {activeBottomTab === "testcases" && (
              <TestCasesPanel
                testCases={testCases}
                activeTestCase={activeTestCase}
                testResults={testResults}
                testLoading={testLoading}
                loading={loading}
                onSetActive={setActiveTestCase}
                onAdd={addTestCase}
                onRemove={removeTestCase}
                onUpdate={updateTestCase}
                onRunTests={handleRunTests}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<MainLayout />} />
      <Route path="/s/:id" element={<SharePage />} />
    </Routes>
  );
}

export default App;
