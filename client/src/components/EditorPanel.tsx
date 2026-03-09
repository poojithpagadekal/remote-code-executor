import { Editor } from "@monaco-editor/react";

interface EditorPanelProps {
  language: string;
  code: string;
  onChange: (val: string) => void;
}

function getExtension(language: string) {
  if (language === "cpp") return "cpp";
  if (language === "java") return "java";
  return "py";
}

export default function EditorPanel({
  language,
  code,
  onChange,
}: EditorPanelProps) {
  return (
    <div
      className="flex flex-col"
      style={{ width: "65%", borderRight: "1px solid #515151" }}
    >
      <div
        className="flex-none h-9 flex items-center"
        style={{
          backgroundColor: "#2b2b2b",
          borderBottom: "1px solid #515151",
        }}
      >
        <div
          className="h-full flex items-center px-4 gap-2 text-xs border-r"
          style={{
            backgroundColor: "#3c3f41",
            borderColor: "#515151",
            color: "#cdd6f4",
          }}
        >
          <span style={{ color: "#4a9eda", fontSize: "10px", fontWeight: 600 }}>
            {language === "java" ? "J" : language === "cpp" ? "C" : "P"}
          </span>
          main.{getExtension(language)}
        </div>
        <div className="flex-1" />
        <span className="text-xs px-3" style={{ color: "#515151" }}>
          {code.length} chars
        </span>
      </div>

      <div className="flex-1 overflow-hidden">
        <Editor
          height="100%"
          language={language}
          value={code}
          onChange={(val) => onChange(val || "")}
          theme="vs-dark"
          options={{
            fontSize: 13,
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            padding: { top: 16, bottom: 12 },
            fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
            fontLigatures: true,
            tabSize: 4,
            wordWrap: "on",
            smoothScrolling: true,
            cursorBlinking: "smooth",
            bracketPairColorization: { enabled: true },
            lineNumbers: "on",
            renderLineHighlight: "line",
          }}
        />
      </div>
    </div>
  );
}
