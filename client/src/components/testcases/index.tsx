import type { TestCase, TestRunResult } from "../../types";
import CaseTabBar from "./CaseTabBar";
import CaseResultBanner from "./CaseResultBanner";
import CaseEditor from "./CaseEditor";
import CaseFooter from "./CaseFooter";

interface TestCasesPanelProps {
  testCases: TestCase[];
  activeTestCase: number;
  testResults: TestRunResult | null;
  testLoading: boolean;
  loading: boolean;
  onSetActive: (idx: number) => void;
  onAdd: () => void;
  onRemove: (idx: number) => void;
  onUpdate: (idx: number, field: "input" | "expected", value: string) => void;
  onRunTests: () => void;
}

export default function TestCasesPanel({
  testCases,
  activeTestCase,
  testResults,
  testLoading,
  loading,
  onSetActive,
  onAdd,
  onRemove,
  onUpdate,
  onRunTests,
}: TestCasesPanelProps) {
  const tc = testCases[activeTestCase];
  const tcResult = testResults?.results[activeTestCase];

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <CaseTabBar
        count={testCases.length}
        active={activeTestCase}
        testResults={testResults}
        onSetActive={onSetActive}
        onAdd={onAdd}
      />

      <div className="flex-1 overflow-auto p-3 space-y-3">
        {tcResult && (
          <CaseResultBanner
            passed={tcResult.passed}
            executionTime={tcResult.executionTime}
          />
        )}

        <CaseEditor
          input={tc?.input || ""}
          expected={tc?.expected || ""}
          actualOutput={tcResult?.actual}
          showActual={!!tcResult && !tcResult.passed}
          canDelete={testCases.length > 1}
          activeIdx={activeTestCase}
          onUpdate={(field, value) => onUpdate(activeTestCase, field, value)}
          onRemove={() => onRemove(activeTestCase)}
        />
      </div>

      <CaseFooter
        testResults={testResults}
        testLoading={testLoading}
        loading={loading}
        onRunTests={onRunTests}
      />
    </div>
  );
}