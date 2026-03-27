interface RunButtonsProps {
  loading: boolean;
  testLoading: boolean;
  onRun: () => void;
  onRunTests: () => void;
}

export default function RunButtons({
  loading,
  testLoading,
  onRun,
  onRunTests,
}: RunButtonsProps) {
  return (
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
  );
}