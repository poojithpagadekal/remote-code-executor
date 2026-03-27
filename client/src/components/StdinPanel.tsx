interface StdinPanelProps {
  stdin: string;
  stdinCollapsed: boolean;
  stdinHeightPct: number;
  onStdinChange: (value: string) => void;
  onCollapse: () => void;
  onExpand: () => void;
  onDragStart: (e: React.MouseEvent) => void;
}

export default function StdinPanel({
  stdin,
  stdinCollapsed,
  stdinHeightPct,
  onStdinChange,
  onCollapse,
  onExpand,
  onDragStart,
}: StdinPanelProps) {
  if (stdinCollapsed) {
    return (
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
          onClick={onExpand}
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
    );
  }

  return (
    <>
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
          <span className="text-xs font-medium" style={{ color: "#cdd6f4" }}>
            stdin
          </span>
          <span className="text-[10px]" style={{ color: "#6d7374" }}>
            — passed to program on Run
          </span>
          <div className="flex-1" />
          <button
            onClick={onCollapse}
            className="text-[10px] px-1.5 py-0.5 rounded transition-colors"
            style={{ color: "#6d7374" }}
            title="Collapse stdin"
          >
            ✕
          </button>
        </div>

        <textarea
          value={stdin}
          onChange={(e) => onStdinChange(e.target.value)}
          placeholder="Enter program input here..."
          className="flex-1 resize-none outline-none px-3 py-2 text-xs overflow-auto"
          style={{
            backgroundColor: "#2b2b2b",
            color: "#cdd6f4",
            fontFamily: "'JetBrains Mono', monospace",
          }}
        />
      </div>

      <div
        onMouseDown={onDragStart}
        className="flex-none flex items-center justify-center cursor-row-resize select-none"
        style={{ height: "6px", backgroundColor: "#1e1f22" }}
      >
        <div
          className="rounded-full"
          style={{ width: "32px", height: "2px", backgroundColor: "#515151" }}
        />
      </div>
    </>
  );
}
