import CodeBlock from "../output/CodeBlock";

interface CaseEditorProps {
  input: string;
  expected: string;
  actualOutput?: string;
  status?: string;
  stderr?: string;
  showActual: boolean;
  canDelete: boolean;
  activeIdx: number;
  onUpdate: (field: "input" | "expected", value: string) => void;
  onRemove: () => void;
}

const STATUS_LABELS: Record<string, string> = {
  compile_error: "Compile error",
  runtime_error: "Runtime error",
  timeout: "Time limit exceeded",
};

const taStyle = {
  backgroundColor: "#313335",
  border: "1px solid #515151",
  color: "#cdd6f4",
  fontFamily: "'JetBrains Mono', monospace",
  outline: "none",
  resize: "none" as const,
  borderRadius: "4px",
  padding: "8px",
  fontSize: "12px",
  width: "100%",
};

export default function CaseEditor({
  input,
  expected,
  actualOutput,
  status,
  stderr,
  showActual,
  canDelete,
  onUpdate,
  onRemove,
}: CaseEditorProps) {
  return (
    <div className="space-y-3">
      <div className="space-y-1">
        <p
          className="text-[10px] uppercase tracking-widest font-medium"
          style={{ color: "#a9b7c6" }}
        >
          Input
        </p>
        <textarea
          value={input}
          onChange={(e) => onUpdate("input", e.target.value)}
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
          value={expected}
          onChange={(e) => onUpdate("expected", e.target.value)}
          placeholder="Enter expected output..."
          rows={2}
          style={taStyle}
        />
      </div>

      {showActual && (
        <>
          {status && status !== "success" && (
            <p className="text-xs font-semibold" style={{ color: "#bc3f3c" }}>
              {STATUS_LABELS[status] ?? status}
            </p>
          )}
          <CodeBlock
            label="Actual Output"
            content={actualOutput || "(empty)"}
            variant="stderr"
          />
          {stderr && (
            <CodeBlock label="Error" content={stderr} variant="stderr" />
          )}
        </>
      )}

      {canDelete && (
        <button
          onClick={onRemove}
          className="text-xs transition-colors"
          style={{ color: "#bc3f3c88" }}
        >
          Delete this case
        </button>
      )}
    </div>
  );
}
