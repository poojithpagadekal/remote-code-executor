export default function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-2">
      <span className="text-2xl" style={{ color: "#515151" }}>
        ▶
      </span>
      <span className="text-xs" style={{ color: "#a9b7c6" }}>
        Run your code to see output
      </span>
    </div>
  );
}