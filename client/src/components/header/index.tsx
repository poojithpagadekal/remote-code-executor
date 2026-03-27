import type { ExecutionStatus } from "../../types";
import BrandLogo from "./BrandLogo";
import LanguageSelector from "./LanguageSelector";
import StatusIndicator from "./StatusIndicator";
import RunButtons from "./RunButtons";

interface HeaderProps {
  language: string;
  loading: boolean;
  testLoading: boolean;
  executionStatus: ExecutionStatus;
  onLanguageChange: (lang: string) => void;
  onRun: () => void;
  onRunTests: () => void;
}

export default function Header({
  language,
  loading,
  testLoading,
  executionStatus,
  onLanguageChange,
  onRun,
  onRunTests,
}: HeaderProps) {
  return (
    <nav
      className="flex-none h-11 flex items-center justify-between px-4"
      style={{ backgroundColor: "#3c3f41", borderBottom: "1px solid #515151" }}
    >
      <div className="flex items-center gap-4">
        <BrandLogo />
        <div className="w-px h-4" style={{ backgroundColor: "#515151" }} />
        <LanguageSelector language={language} onChange={onLanguageChange} />
      </div>

      <StatusIndicator status={executionStatus} />

      <RunButtons
        loading={loading}
        testLoading={testLoading}
        onRun={onRun}
        onRunTests={onRunTests}
      />
    </nav>
  );
}