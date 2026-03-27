export default function BrandLogo() {
  return (
    <div className="flex items-center gap-2">
      <div
        className="w-5 h-5 rounded flex items-center justify-center text-[9px] font-bold"
        style={{ backgroundColor: "#4a9eda", color: "#2b2b2b" }}
      >
        {"</>"}
      </div>
      <span
        className="text-sm font-bold tracking-tight"
        style={{ color: "#a9b7c6", fontFamily: "'JetBrains Mono', monospace" }}
      >
        CodeRun
      </span>
    </div>
  );
}