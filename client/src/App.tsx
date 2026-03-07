import { useState } from "react";
import { Editor } from "@monaco-editor/react";
import axios from "axios";

interface ExecutionResult {
  stdout: string;
  stderr: string;
  exitCode: number;
  status: "success" | "compile_error" | "runtime_error" | "timeout";
  executionTime: number;
}

const LANGUAGES = ["python", "cpp", "java"];

const DEFAULT_CODE: Record<string, string> = {
  python: `print("Hello World")`,
  cpp: `#include <iostream>
int main() {
    std::cout << "Hello World" << std::endl;
    return 0;
}`,
  java: `public class Main {
    public static void main(String[] args) {
        System.out.println("Hello World");
    }
}`,
};

function App() {
  const [language, setLanguage] = useState("python");
  const [code, setCode] = useState(DEFAULT_CODE["python"]);
  const [result, setResult] = useState<ExecutionResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLanguageChange = (lang: string) => {
    setLanguage(lang);
    setCode(DEFAULT_CODE[lang]);
    setResult(null);
    setError("");
  };

  const handleRun = async () => {
    setLoading(true);
    setResult(null);
    setError("");

    try {
      const response = await axios.post("http://localhost:3000/api/execute", {
        language,
        code,
      });
      setResult(response.data);
    } catch (err) {
      const error = err as { response?: { data?: { error?: string } } };
      setError(error.response?.data?.error || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case "success":
        return "text-green-400";
      case "compile_error":
        return "text-yellow-400";
      case "runtime_error":
        return "text-red-400";
      case "timeout":
        return "text-orange-400";
      default:
        return "text-gray-400";
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col ">
      {/* Header */}
      <div className="border-b border-gray-800 px-6 py-4 flex items-center justify-between">
        <h1 className="text-xl font-bold text-white">Remote Code Executor</h1>
        <div className="flex items-center gap-3">
          {LANGUAGES.map((lang) => (
            <button
              key={lang}
              onClick={() => handleLanguageChange(lang)}
              className={`px-4 py-1.5 rounded text-sm font-medium transition-colors ${language === lang ? "bg-blue-600 text-white" : "bg-gray-800 text-gray-400 hover:bg-gray-700"}`}
            >
              {lang}
            </button>
          ))}
          <button
            onClick={handleRun}
            disabled={loading}
            className="px-5 py-1.5 bg-green-600 hover:bg-green-500 disabled:bg-green-900 rounded text-sm font-medium transition-colors"
          >
            {loading ? "Running..." : "▶ Run"}
          </button>{" "}
        </div>
      </div>

      {/* Main */}
      <div
        className="flex flex-1 overflow-hidden"
        style={{ height: "calc(100vh - 57px)" }}
      >
        {/* Editor */}
        <div className="flex-1 border-r border-gray-800">
          <Editor
            height="100%"
            language={language === "cpp" ? "cpp" : language}
            value={code}
            onChange={(val) => setCode(val || "")}
            theme="vs-dark"
            options={{
              fontSize: 14,
              minimap: { enabled: false },
              scrollBeyondLastLine: false,
              padding: { top: 16 },
            }}
          />
        </div>
        {/* Output */}
        <div className="w-96 flex flex-col bg-gray-900">
          <div className="px-4 py-3 border-b border-gray-800 text-sm text-gray-400 font-medium">
            Output
          </div>
          <div className="flex-1 p-4 overflow-auto font-mono text-sm">
            {!result && !error && !loading && (
              <p className="text-gray-600">Run your code to see output</p>
            )}
            {loading && (
              <p className="text-gray-400 animate-pulse">Executing...</p>
            )}
            {error && <p className="text-red-400">{error}</p>}
            {result && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span
                    className={`font-medium ${getStatusColor(result.status)}`}
                  >
                    {result.status.replace("_", " ").toUpperCase()}
                  </span>
                  <span className="text-gray-500 text-xs">
                    {result.executionTime}ms
                  </span>
                </div>
                {result.stdout && (
                  <div>
                    <p className="text-gray-500 text-xs mb-1">stdout</p>
                    <pre className="text-green-300 whitespace-pre-wrap">
                      {result.stdout}
                    </pre>
                  </div>
                )}
                {result.stderr && (
                  <div>
                    <p className="text-gray-500 text-xs mb-1">stderr</p>
                    <pre className="text-red-300 whitespace-pre-wrap">
                      {result.stderr}
                    </pre>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
