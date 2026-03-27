interface CaseResultBannerProps {
  passed: boolean;
  executionTime: number;
}

export default function CaseResultBanner({
  passed,
  executionTime,
}: CaseResultBannerProps) {
  return (
    <div
      className="rounded p-2.5 flex items-center justify-between text-xs"
      style={{
        backgroundColor: passed ? "#62975511" : "#bc3f3c11",
        border: `1px solid ${passed ? "#62975544" : "#bc3f3c44"}`,
      }}
    >
      <span style={{ color: passed ? "#629755" : "#bc3f3c", fontWeight: 600 }}>
        {passed ? "✓ Passed" : "✗ Failed"}
      </span>
      <span style={{ color: "#6d7374" }}>⚡ {executionTime} ms</span>
    </div>
  );
}