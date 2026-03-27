import EmptyState from "./EmptyState";
import LoadingState from "./LoadingState";
import ErrorBlock from "./ErrorBlock";
import CodeBlock from "./CodeBlock";
import ResultHeader from "./ResultHeader";
import type { ExecutionResult } from "../../types";

interface OutputPanelProps {
  result: ExecutionResult | null;
  loading: boolean;
  error: string;
  executionId: string | null;
  onClear: () => void;
}

export default function OutputPanel({
  result,
  loading,
  error,
  executionId,
  onClear,
}: OutputPanelProps) {
  return (
    <div className="flex-1 overflow-auto p-4 space-y-3">
      {!result && !error && !loading && <EmptyState />}
      {loading && <LoadingState />}
      {error && <ErrorBlock message={error} />}

      {result && (
        <div className="space-y-3">
          <ResultHeader
            result={result}
            executionId={executionId}
            onClear={onClear}
          />
          {result.stdout && (
            <CodeBlock
              label="stdout"
              content={result.stdout}
              variant="stdout"
            />
          )}
          {result.stderr && (
            <CodeBlock
              label="stderr"
              content={result.stderr}
              variant="stderr"
            />
          )}
        </div>
      )}
    </div>
  );
}