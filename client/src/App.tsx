import { Routes, Route } from "react-router-dom";
import { useState } from "react";
import SharePage from "./pages/SharePage";
import Header from "./components/header";
import EditorPanel from "./components/EditorPanel";
import OutputPanel from "./components/output";
import TestCasesPanel from "./components/testcases";
import StdinPanel from "./components/StdinPanel";
import BottomPanel from "./components/BottomPanel";
import { useCodeEditor } from "./hooks/useCodeEditor";
import { useExecution } from "./hooks/useExecution";
import { useTestCases } from "./hooks/useTestCases";
import { useStdinPanel } from "./hooks/useStdinPanel";

function MainLayout() {
  const { language, code, setCode, handleLanguageChange } = useCodeEditor();

  const {
    loading,
    result,
    error,
    executionId,
    executionStatus,
    handleRun,
    handleClearOutput,
  } = useExecution();

  const {
    testCases,
    activeTestCase,
    setActiveTestCase,
    testResults,
    setTestResults,
    testLoading,
    handleRunTests,
    addTestCase,
    removeTestCase,
    updateTestCase,
  } = useTestCases();

  const {
    stdin,
    setStdin,
    stdinCollapsed,
    setStdinCollapsed,
    stdinHeightPct,
    rightPanelRef,
    onDragStart,
  } = useStdinPanel();

  const [activeBottomTab, setActiveBottomTab] = useState<
    "output" | "testcases"
  >("output");

  return (
    <div
      className="h-screen flex flex-col overflow-hidden"
      style={{
        backgroundColor: "#2b2b2b",
        fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
      }}
    >
      <Header
        language={language}
        loading={loading}
        testLoading={testLoading}
        executionStatus={executionStatus}
        onLanguageChange={(lang) => {
          handleLanguageChange(lang);
          handleClearOutput();
          setTestResults(null);
        }}
        onRun={() => {
          setActiveBottomTab("output");
          handleRun(language, code, stdin);
        }}
        onRunTests={() =>
          handleRunTests(language, code, () => {}, setActiveBottomTab)
        }
      />

      <div className="flex flex-1 overflow-hidden">
        <EditorPanel language={language} code={code} onChange={setCode} />

        <div
          ref={rightPanelRef}
          className="flex flex-col flex-1 overflow-hidden"
        >
          <StdinPanel
            stdin={stdin}
            stdinCollapsed={stdinCollapsed}
            stdinHeightPct={stdinHeightPct}
            onStdinChange={setStdin}
            onCollapse={() => setStdinCollapsed(true)}
            onExpand={() => setStdinCollapsed(false)}
            onDragStart={onDragStart}
          />
          <BottomPanel
            activeTab={activeBottomTab}
            onTabChange={setActiveBottomTab}
            result={result}
            loading={loading}
            error={error}
            executionId={executionId}
            onClearOutput={handleClearOutput}
            testCases={testCases}
            activeTestCase={activeTestCase}
            testResults={testResults}
            testLoading={testLoading}
            onSetActive={setActiveTestCase}
            onAddTestCase={addTestCase}
            onRemoveTestCase={removeTestCase}
            onUpdateTestCase={updateTestCase}
            onRunTests={() =>
              handleRunTests(language, code, () => {}, setActiveBottomTab)
            }
          />
        </div>
      </div>
    </div>
  );
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<MainLayout />} />
      <Route path="/s/:id" element={<SharePage />} />
    </Routes>
  );
}

export default App;