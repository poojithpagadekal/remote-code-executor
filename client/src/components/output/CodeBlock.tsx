interface CodeBlockProps {
  label: string;
  content: string;
  variant: "stdout" | "stderr";
}

const VARIANT_STYLES = {
  stdout: { border: "1px solid #515151", color: "#cdd6f4" },
  stderr: { border: "1px solid #bc3f3c44", color: "#bc3f3c" },
};

export default function CodeBlock({ label, content, variant }: CodeBlockProps) {
  return (
    <div className="space-y-1">
      <p
        className="text-[10px] uppercase tracking-widest font-medium"
        style={{ color: "#a9b7c6" }}
      >
        {label}
      </p>
      <pre
        className="rounded p-3 text-xs whitespace-pre-wrap overflow-auto"
        style={{
          backgroundColor: "#313335",
          fontFamily: "'JetBrains Mono', monospace",
          maxHeight: "200px",
          ...VARIANT_STYLES[variant],
        }}
      >
        {content}
      </pre>
    </div>
  );
}