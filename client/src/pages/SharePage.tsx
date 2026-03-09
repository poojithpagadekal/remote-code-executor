import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Editor } from "@monaco-editor/react";
import axios from "axios";

interface ExecutionRecord {
  id: string;
  language: string;
  code: string;
  stdin: string;
  stdout: string;
  stderr: string;
  status: string;
  exitCode: number;
  executionTime: number;
  createdAt: string;
}

const STATUS_STYLES: Record<
  string,
  { bg: string; text: string; border: string; dot: string }
> = {
  success: {
    dot: "bg-green-400",
    bg: "rgba(16,185,129,0.08)",
    text: "#10b981",
    border: "rgba(16,185,129,0.25)",
  },
  compile_error: {
    dot: "bg-yellow-400",
    bg: "rgba(234,179,8,0.08)",
    text: "#eab308",
    border: "rgba(234,179,8,0.25)",
  },
  runtime_error: {
    dot: "bg-red-400",
    bg: "rgba(239,68,68,0.08)",
    text: "#ef4444",
    border: "rgba(239,68,68,0.25)",
  },
  timeout: {
    dot: "bg-orange-400",
    bg: "rgba(249,115,22,0.08)",
    text: "#f97316",
    border: "rgba(249,115,22,0.25)",
  },
};

export default function SharePage() {
  const { id } = useParams<{ id: string }>();
  const [record, setRecord] = useState<ExecutionRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    axios
      .get(`http://localhost:3000/api/executions/${id}`)
      .then((res) => setRecord(res.data))
      .catch(() => setError("Execution not found or expired"))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading)
    return (
      <div
        className="h-screen flex items-center justify-center"
        style={{ backgroundColor: "#1a1b2e" }}
      >
        <div
          className="flex items-center gap-2 text-xs"
          style={{ color: "#64748b" }}
        >
          <span
            className="w-3 h-3 border rounded-full animate-spin"
            style={{ borderColor: "#263859", borderTopColor: "#00d4ff" }}
          />
          Loading...
        </div>
      </div>
    );

  if (error || !record)
    return (
      <div
        className="h-screen flex items-center justify-center"
        style={{ backgroundColor: "#1a1b2e" }}
      >
        <p className="text-xs" style={{ color: "#ef4444" }}>
          {error || "Not found"}
        </p>
      </div>
    );

  const s = STATUS_STYLES[record.status] || STATUS_STYLES["runtime_error"];

  return (
    <div
      className="h-screen flex flex-col overflow-hidden"
      style={{
        backgroundColor: "#1a1b2e",
        fontFamily: "'JetBrains Mono', monospace",
      }}
    >
      <nav
        className="flex-none h-12 flex items-center justify-between px-5"
        style={{
          backgroundColor: "#16213e",
          borderBottom: "1px solid #263859",
        }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-6 h-6 rounded-md flex items-center justify-center text-[11px] font-bold text-black"
            style={{ backgroundColor: "#00d4ff" }}
          >
            {"</>"}
          </div>
          <span className="text-sm font-bold" style={{ color: "#e2e8f0" }}>
            CodeRun
          </span>
          <div className="w-px h-4" style={{ backgroundColor: "#263859" }} />
          <span
            className="px-2.5 py-1 rounded text-xs font-medium"
            style={{
              backgroundColor: "rgba(0,212,255,0.1)",
              color: "#00d4ff",
              border: "1px solid rgba(0,212,255,0.2)",
            }}
          >
            {record.language}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs" style={{ color: "#374151" }}>
            {new Date(record.createdAt).toLocaleString()}
          </span>
          <span
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium"
            style={{
              backgroundColor: s.bg,
              border: `1px solid ${s.border}`,
              color: s.text,
            }}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
            {record.status.replace(/_/g, " ").toUpperCase()}
          </span>
          <span className="text-xs" style={{ color: "#374151" }}>
            ⏱ {record.executionTime}ms
          </span>
        </div>
      </nav>

      <div className="flex flex-1 overflow-hidden">
        <div
          className="flex flex-col"
          style={{ width: "70%", borderRight: "1px solid #263859" }}
        >
          <div
            className="flex-none h-9 flex items-center px-4"
            style={{
              backgroundColor: "#16213e",
              borderBottom: "1px solid #263859",
            }}
          >
            <span className="text-xs" style={{ color: "#64748b" }}>
              main.
              {record.language === "cpp"
                ? "cpp"
                : record.language === "java"
                  ? "java"
                  : "py"}
            </span>
            <span
              className="ml-2 text-[10px] px-1.5 py-0.5 rounded"
              style={{ backgroundColor: "#263859", color: "#64748b" }}
            >
              read only
            </span>
          </div>
          <div className="flex-1">
            <Editor
              height="100%"
              language={record.language}
              value={record.code}
              theme="vs-dark"
              options={{
                fontSize: 13,
                minimap: { enabled: false },
                readOnly: true,
                scrollBeyondLastLine: false,
                padding: { top: 12 },
                fontFamily: "'JetBrains Mono', monospace",
                fontLigatures: true,
              }}
            />
          </div>
        </div>

        <div className="flex-1 overflow-auto p-4 space-y-4">
          {record.stdin && (
            <div className="space-y-1.5">
              <p
                className="text-[10px] uppercase tracking-widest"
                style={{ color: "#374151" }}
              >
                stdin
              </p>
              <pre
                className="rounded-lg p-3 text-xs whitespace-pre-wrap"
                style={{
                  backgroundColor: "#16213e",
                  border: "1px solid #263859",
                  color: "#94a3b8",
                }}
              >
                {record.stdin}
              </pre>
            </div>
          )}

          {record.stdout && (
            <div className="space-y-1.5">
              <p
                className="text-[10px] uppercase tracking-widest"
                style={{ color: "#374151" }}
              >
                stdout
              </p>
              <pre
                className="rounded-lg p-3 text-xs whitespace-pre-wrap"
                style={{
                  backgroundColor: "#16213e",
                  border: "1px solid #263859",
                  color: "#10b981",
                }}
              >
                {record.stdout}
              </pre>
            </div>
          )}

          {record.stderr && (
            <div className="space-y-1.5">
              <p
                className="text-[10px] uppercase tracking-widest"
                style={{ color: "#374151" }}
              >
                stderr
              </p>
              <pre
                className="rounded-lg p-3 text-xs whitespace-pre-wrap"
                style={{
                  backgroundColor: "#16213e",
                  border: "1px solid rgba(239,68,68,0.2)",
                  color: "#ef4444",
                }}
              >
                {record.stderr}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
