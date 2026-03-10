import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Editor } from "@monaco-editor/react";
import axios from "axios";

interface SharedExecution {
  id: string;
  language: string;
  code: string;
  stdout: string;
  stderr: string;
  status: string;
  executionTime: number;
}

const STATUS_STYLES: Record<string, { dot: string; bg: string; text: string; border: string }> = {
  success:       { dot: "#629755", bg: "#62975511", text: "#629755", border: "#62975544" },
  compile_error: { dot: "#bbb529", bg: "#bbb52911", text: "#bbb529", border: "#bbb52944" },
  runtime_error: { dot: "#bc3f3c", bg: "#bc3f3c11", text: "#bc3f3c", border: "#bc3f3c44" },
  timeout:       { dot: "#cc7832", bg: "#cc783211", text: "#cc7832", border: "#cc783244" },
};

function getExtension(language: string) {
  if (language === "cpp") return "cpp";
  if (language === "java") return "java";
  return "py";
}

export default function SharePage() {
  const { id } = useParams<{ id: string }>();
  const [execution, setExecution] = useState<SharedExecution | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    axios
      .get(`http://localhost:3000/api/executions/${id}`)
      .then((res) => setExecution(res.data))
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div
        className="h-screen flex items-center justify-center"
        style={{ backgroundColor: "#2b2b2b" }}
      >
        <div className="flex items-center gap-3">
          <span
            className="w-4 h-4 border-2 rounded-full animate-spin"
            style={{ borderColor: "#515151", borderTopColor: "#4a9eda" }}
          />
          <span className="text-sm" style={{ color: "#a9b7c6", fontFamily: "'JetBrains Mono', monospace" }}>
            Loading execution...
          </span>
        </div>
      </div>
    );
  }

  if (notFound || !execution) {
    return (
      <div
        className="h-screen flex flex-col items-center justify-center gap-3"
        style={{ backgroundColor: "#2b2b2b" }}
      >
        <span className="text-4xl" style={{ color: "#515151" }}>✕</span>
        <p className="text-sm" style={{ color: "#a9b7c6", fontFamily: "'JetBrains Mono', monospace" }}>
          Execution not found or expired
        </p>
        <p className="text-xs" style={{ color: "#6d7374" }}>
          Shared executions expire after 7 days
        </p>
        <a
          href="/"
          className="mt-2 text-xs px-4 py-2 rounded transition-colors"
          style={{ backgroundColor: "#4a9eda22", border: "1px solid #4a9eda44", color: "#4a9eda" }}
        >
          Open CodeRun
        </a>
      </div>
    );
  }

  const s = STATUS_STYLES[execution.status] || STATUS_STYLES["runtime_error"];
  const ext = getExtension(execution.language);

  return (
    <div
      className="h-screen flex flex-col overflow-hidden"
      style={{ backgroundColor: "#2b2b2b", fontFamily: "'JetBrains Mono', 'Fira Code', monospace" }}
    >
      <nav
        className="flex-none h-11 flex items-center justify-between px-4"
        style={{ backgroundColor: "#1e1f22", borderBottom: "1px solid #515151" }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-5 h-5 rounded flex items-center justify-center text-[9px] font-bold"
            style={{ backgroundColor: "#4a9eda", color: "#1e1f22" }}
          >
            {"</>"}
          </div>
          <span className="text-sm font-bold" style={{ color: "#cdd6f4" }}>
            CodeRun
          </span>
          <div className="w-px h-4" style={{ backgroundColor: "#515151" }} />
          <span className="text-xs px-2 py-0.5 rounded" style={{ backgroundColor: "#4a9eda22", color: "#4a9eda", border: "1px solid #4a9eda44" }}>
            {execution.language}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <div
            className="inline-flex items-center gap-2 px-2.5 py-1 rounded text-xs font-medium"
            style={{ backgroundColor: s.bg, border: `1px solid ${s.border}`, color: s.text }}
          >
            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: s.dot }} />
            {execution.status.replace(/_/g, " ").toUpperCase()}
          </div>
          <span className="text-xs" style={{ color: "#6d7374" }}>
            ⚡ {execution.executionTime} ms
          </span>
        </div>

        <a
          href="/"
          className="text-xs px-3 py-1.5 rounded transition-colors"
          style={{ backgroundColor: "#629755", color: "#fff", fontWeight: 600 }}
        >
          Open Editor
        </a>
      </nav>

      <div className="flex flex-1 overflow-hidden">

        <div className="flex flex-col" style={{ width: "65%", borderRight: "1px solid #515151" }}>
          <div
            className="flex-none h-9 flex items-center"
            style={{ backgroundColor: "#2b2b2b", borderBottom: "1px solid #515151" }}
          >
            <div
              className="h-full flex items-center px-4 gap-2 text-xs border-r"
              style={{ backgroundColor: "#3c3f41", borderColor: "#515151", color: "#cdd6f4" }}
            >
              <span style={{ color: "#4a9eda", fontSize: "10px", fontWeight: 600 }}>
                {execution.language === "java" ? "J" : execution.language === "cpp" ? "C" : "P"}
              </span>
              main.{ext}
              <span
                className="ml-1 text-[10px] px-1.5 py-0.5 rounded"
                style={{ backgroundColor: "#6d737422", color: "#6d7374", border: "1px solid #51515144" }}
              >
                read only
              </span>
            </div>
          </div>
          <div className="flex-1 overflow-hidden">
            <Editor
              height="100%"
              language={execution.language}
              value={execution.code}
              theme="vs-dark"
              options={{
                readOnly: true,
                fontSize: 13,
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                padding: { top: 16, bottom: 12 },
                fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                fontLigatures: true,
                lineNumbers: "on",
                renderLineHighlight: "line",
                cursorStyle: "line",
              }}
            />
          </div>
        </div>

        <div className="flex flex-col flex-1 overflow-hidden">
          <div
            className="flex-none h-9 flex items-center px-4"
            style={{ backgroundColor: "#3c3f41", borderBottom: "1px solid #515151" }}
          >
            <span className="text-xs font-medium" style={{ color: "#cdd6f4" }}>Output</span>
          </div>

          <div className="flex-1 overflow-auto p-4 space-y-3">
            {execution.stdout && (
              <div className="space-y-1">
                <p className="text-[10px] uppercase tracking-widest font-medium" style={{ color: "#a9b7c6" }}>
                  stdout
                </p>
                <pre
                  className="rounded p-3 text-xs whitespace-pre-wrap overflow-auto"
                  style={{
                    backgroundColor: "#313335",
                    border: "1px solid #515151",
                    color: "#cdd6f4",
                    fontFamily: "'JetBrains Mono', monospace",
                    maxHeight: "300px",
                  }}
                >
                  {execution.stdout}
                </pre>
              </div>
            )}

            {execution.stderr && (
              <div className="space-y-1">
                <p className="text-[10px] uppercase tracking-widest font-medium" style={{ color: "#a9b7c6" }}>
                  stderr
                </p>
                <pre
                  className="rounded p-3 text-xs whitespace-pre-wrap overflow-auto"
                  style={{
                    backgroundColor: "#313335",
                    border: "1px solid #bc3f3c44",
                    color: "#bc3f3c",
                    fontFamily: "'JetBrains Mono', monospace",
                    maxHeight: "300px",
                  }}
                >
                  {execution.stderr}
                </pre>
              </div>
            )}

            {!execution.stdout && !execution.stderr && (
              <div className="flex flex-col items-center justify-center h-full gap-2">
                <span style={{ color: "#515151", fontSize: "24px" }}>▶</span>
                <span className="text-xs" style={{ color: "#a9b7c6" }}>No output</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}