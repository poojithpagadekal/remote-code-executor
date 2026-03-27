import CodeBlock from "../output/CodeBlock";

interface CaseEditorProps {
  input: string;
  expected: string;
  actualOutput?: string;
  showActual: boolean;
  canDelete: boolean;
  activeIdx: number;
  onUpdate: (field: "input" | "expected", value: string) => void;
  onRemove: () => void;
}

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
        <CodeBlock
          label="Actual Output"
          content={actualOutput || "(empty)"}
          variant="stderr"
        />
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