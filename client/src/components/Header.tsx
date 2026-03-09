import { LANGUAGES } from "../types";
import type { ExecutionStatus } from "../types";

interface HeaderProps {
  language: string;
  loading: boolean;
  testLoading: boolean;
  executionStatus: ExecutionStatus;
  onLanguageChange: (lang: string) => void;
  onRun: () => void;
  onRunTests: () => void;
}

const STATUS_CONFIG: Record<
  ExecutionStatus,
  { dot: string; label: string; color: string }
> = {
  idle: { dot: "#6d7374", label: "Ready", color: "#a9b7c6" }, // was #6d7374
  running: { dot: "#bbb529", label: "Running...", color: "#bbb529" },
  success: { dot: "#629755", label: "Success", color: "#629755" },
  failed: { dot: "#bc3f3c", label: "Failed", color: "#bc3f3c" },
};

export default function Header({
  language,
  loading,
  testLoading,
  executionStatus,
  onLanguageChange,
  onRun,
  onRunTests,
}: HeaderProps) {
  const s = STATUS_CONFIG[executionStatus];

  return (
    <nav
      className="flex-none h-11 flex items-center justify-between px-4"
      style={{ backgroundColor: "#3c3f41", borderBottom: "1px solid #515151" }}
    >
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <div
            className="w-5 h-5 rounded flex items-center justify-center text-[9px] font-bold"
            style={{ backgroundColor: "#4a9eda", color: "#2b2b2b" }}
          >
            {"</>"}
          </div>
          <span
            className="text-sm font-bold tracking-tight"
            style={{
              color: "#a9b7c6",
              fontFamily: "'JetBrains Mono', monospace",
            }}
          >
            CodeRun
          </span>
        </div>

        <div className="w-px h-4" style={{ backgroundColor: "#515151" }} />

        <div className="flex items-center gap-1">
          {LANGUAGES.map((lang) => (
            <button
              key={lang}
              onClick={() => onLanguageChange(lang)}
              className="px-3 py-1 rounded text-xs transition-all"
              style={
                language === lang
                  ? {
                      backgroundColor: "#4a9eda22",
                      color: "#4a9eda",
                      border: "1px solid #4a9eda55",
                      fontWeight: 600,
                    }
                  : { color: "#6d7374", border: "1px solid transparent" }
              }
            >
              {lang}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-2">
        {executionStatus === "running" ? (
          <span
            className="w-2 h-2 rounded-full animate-pulse"
            style={{ backgroundColor: s.dot }}
          />
        ) : (
          <span
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: s.dot }}
          />
        )}
        <span
          className="text-xs"
          style={{ color: s.color, fontFamily: "monospace" }}
        >
          {s.label}
        </span>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={onRun}
          disabled={loading || testLoading}
          className="flex items-center gap-1.5 px-4 py-1.5 rounded text-xs font-bold transition-all disabled:opacity-40"
          style={{ backgroundColor: "#629755", color: "#fff" }}
        >
          {loading ? (
            <span className="w-3 h-3 border border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            "▶"
          )}
          {loading ? "Running" : "Run"}
        </button>

        <button
          onClick={onRunTests}
          disabled={testLoading || loading}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium transition-all disabled:opacity-40"
          style={{
            backgroundColor: "#3c3f41",
            border: "1px solid #515151",
            color: "#a9b7c6",
          }}
        >
          {testLoading ? (
            <span className="w-3 h-3 border border-white/30 border-t-white/80 rounded-full animate-spin" />
          ) : (
            "⚡"
          )}
          Run Tests
        </button>
      </div>
    </nav>
  );
}
