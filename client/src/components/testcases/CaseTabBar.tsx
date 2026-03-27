import type { TestRunResult } from "../../types";

interface CaseTabBarProps {
  count: number;
  active: number;
  testResults: TestRunResult | null;
  onSetActive: (idx: number) => void;
  onAdd: () => void;
}

export default function CaseTabBar({
  count,
  active,
  testResults,
  onSetActive,
  onAdd,
}: CaseTabBarProps) {
  return (
    <div
      className="flex-none flex items-center gap-1 px-3 py-1.5 flex-wrap"
      style={{ borderBottom: "1px solid #515151", backgroundColor: "#313335" }}
    >
      {Array.from({ length: count }, (_, idx) => {
        const r = testResults?.results[idx];
        return (
          <button
            key={idx}
            onClick={() => onSetActive(idx)}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded text-xs transition-all"
            style={
              active === idx
                ? {
                    backgroundColor: "#4a9eda22",
                    color: "#4a9eda",
                    border: "1px solid #4a9eda44",
                  }
                : { color: "#6d7374", border: "1px solid transparent" }
            }
          >
            {r && (
              <span
                className="w-1.5 h-1.5 rounded-full"
                style={{ backgroundColor: r.passed ? "#629755" : "#bc3f3c" }}
              />
            )}
            Case {idx + 1}
          </button>
        );
      })}

      <button
        onClick={onAdd}
        disabled={count >= 10}
        className="px-2 py-1 rounded text-xs transition-all disabled:opacity-20"
        style={{ color: "#6d7374" }}
      >
        + Add
      </button>
    </div>
  );
}