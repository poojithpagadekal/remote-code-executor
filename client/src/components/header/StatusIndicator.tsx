import type { ExecutionStatus } from "../../types";

const STATUS_CONFIG: Record<
  ExecutionStatus,
  { dot: string; label: string; color: string }
> = {
  idle: { dot: "#6d7374", label: "Ready", color: "#a9b7c6" },
  running: { dot: "#bbb529", label: "Running...", color: "#bbb529" },
  success: { dot: "#629755", label: "Success", color: "#629755" },
  failed: { dot: "#bc3f3c", label: "Failed", color: "#bc3f3c" },
};

interface StatusIndicatorProps {
  status: ExecutionStatus;
}

export default function StatusIndicator({ status }: StatusIndicatorProps) {
  const s = STATUS_CONFIG[status];

  return (
    <div className="flex items-center gap-2">
      <span
        className={`w-2 h-2 rounded-full ${status === "running" ? "animate-pulse" : ""}`}
        style={{ backgroundColor: s.dot }}
      />
      <span
        className="text-xs"
        style={{ color: s.color, fontFamily: "monospace" }}
      >
        {s.label}
      </span>
    </div>
  );
}