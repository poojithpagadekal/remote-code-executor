import { useState } from "react";
import type { ExecutionResult } from "../../types";

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

interface ResultHeaderProps {
  result: ExecutionResult;
  executionId: string | null;
  onClear: () => void;
}

export default function ResultHeader({
  result,
  executionId,
  onClear,
}: ResultHeaderProps) {
  const [copied, setCopied] = useState(false);
  const s = STATUS_STYLES[result.status] ?? STATUS_STYLES["runtime_error"];

  const handleShare = () => {
    navigator.clipboard.writeText(`${window.location.origin}/s/${executionId}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
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
  );
}