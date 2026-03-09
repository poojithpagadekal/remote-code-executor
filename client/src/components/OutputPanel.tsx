import { useState } from "react";
import type { ExecutionResult } from "../types";

interface OutputPanelProps {
  result: ExecutionResult | null;
  loading: boolean;
  error: string;
  executionId: string | null;
  onClear: () => void;
}

const STATUS_STYLES: Record<
  string,
  { dot: string; bg: string; text: string; border: string }
> = {
  success: {
    dot: "#629755",
    bg: "#62975511",
    text: "#629755",
    border: "#62975544",
  },
  compile_error: {
    dot: "#bbb529",
    bg: "#bbb52911",
    text: "#bbb529",
    border: "#bbb52944",
  },
  runtime_error: {
    dot: "#bc3f3c",
    bg: "#bc3f3c11",
    text: "#bc3f3c",
    border: "#bc3f3c44",
  },
  timeout: {
    dot: "#cc7832",
    bg: "#cc783211",
    text: "#cc7832",
    border: "#cc783244",
  },
};

export default function OutputPanel({
  result,
  loading,
  error,
  executionId,
  onClear,
}: OutputPanelProps) {
  const [copied, setCopied] = useState(false);

  const handleShare = () => {
    navigator.clipboard.writeText(`${window.location.origin}/s/${executionId}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const s = result
    ? STATUS_STYLES[result.status] || STATUS_STYLES["runtime_error"]
    : null;

  return (
    <div className="flex-1 overflow-auto p-4 space-y-3">
      {!result && !error && !loading && (
        <div className="flex flex-col items-center justify-center h-full gap-2">
          <span className="text-2xl" style={{ color: "#515151" }}>
            ▶
          </span>
          <span className="text-xs" style={{ color: "#a9b7c6" }}>
            Run your code to see output
          </span>
        </div>
      )}

      {loading && (
        <div
          className="flex items-center gap-2 text-xs"
          style={{ color: "#a9b7c6" }}
        >
          <span
            className="w-3 h-3 border rounded-full animate-spin"
            style={{ borderColor: "#515151", borderTopColor: "#4a9eda" }}
          />
          Executing in sandbox...
        </div>
      )}

      {error && (
        <div
          className="rounded p-3 text-xs"
          style={{
            backgroundColor: "#bc3f3c11",
            border: "1px solid #bc3f3c44",
            color: "#bc3f3c",
          }}
        >
          {error}
        </div>
      )}

      {result && s && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div
              className="inline-flex items-center gap-2 px-2.5 py-1 rounded text-xs font-medium"
              style={{
                backgroundColor: s.bg,
                border: `1px solid ${s.border}`,
                color: s.text,
              }}
            >
              <span
                className="w-1.5 h-1.5 rounded-full"
                style={{ backgroundColor: s.dot }}
              />
              {result.status.replace(/_/g, " ").toUpperCase()}
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs" style={{ color: "#a9b7c6" }}>
                ⚡ {result.executionTime} ms
              </span>
              {executionId && (
                <button
                  onClick={handleShare}
                  className="text-xs transition-colors"
                  style={{ color: copied ? "#629755" : "#4a9eda" }}
                >
                  {copied ? "✓ Link copied!" : "Share →"}
                </button>
              )}
              <button
                onClick={onClear}
                className="text-xs transition-colors"
                style={{ color: "#a9b7c6" }}
                title="Clear"
              >
                ✕ Clear
              </button>
            </div>
          </div>

          {result.stdout && (
            <div className="space-y-1">
              <p
                className="text-[10px] uppercase tracking-widest font-medium"
                style={{ color: "#a9b7c6" }}
              >
                stdout
              </p>
              <pre
                className="rounded p-3 text-xs whitespace-pre-wrap overflow-auto"
                style={{
                  backgroundColor: "#313335",
                  border: "1px solid #515151",
                  color: "#cdd6f4",
                  fontFamily: "'JetBrains Mono', monospace",
                  maxHeight: "200px",
                }}
              >
                {result.stdout}
              </pre>
            </div>
          )}

          {result.stderr && (
            <div className="space-y-1">
              <p
                className="text-[10px] uppercase tracking-widest font-medium"
                style={{ color: "#a9b7c6" }}
              >
                stderr
              </p>
              <pre
                className="rounded p-3 text-xs whitespace-pre-wrap overflow-auto"
                style={{
                  backgroundColor: "#313335",
                  border: "1px solid #bc3f3c44",
                  color: "#bc3f3c",
                  fontFamily: "'JetBrains Mono', monospace",
                  maxHeight: "200px",
                }}
              >
                {result.stderr}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
