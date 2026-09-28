import type { ReactNode } from "react";
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import { getErrorMessage } from "@/lib/errors";
import Spinner from "./Spinner";

/** Inline error block with a retry button. */
export function ErrorState({ error, onRetry, compact }: { error: unknown; onRetry?: () => void; compact?: boolean }) {
  return (
    <div
      role="alert"
      className={`flex flex-col items-center gap-3 rounded-2xl border border-destructive/20 bg-destructive/5 text-center ${
        compact ? "p-4" : "p-8"
      }`}
    >
      <ExclamationTriangleIcon className="h-6 w-6 text-destructive" />
      <p className="text-sm text-foreground">{getErrorMessage(error)}</p>
      {onRetry && (
        <button type="button" onClick={onRetry} className="text-sm font-semibold text-primary hover:underline">
          Try again
        </button>
      )}
    </div>
  );
}

interface QueryStateProps {
  isLoading: boolean;
  error: unknown;
  onRetry?: () => void;
  isEmpty?: boolean;
  empty?: ReactNode;
  loading?: ReactNode;
  children: ReactNode;
}

/** Renders loading / error / empty / content for a query in one place. */
export default function QueryState({ isLoading, error, onRetry, isEmpty, empty, loading, children }: QueryStateProps) {
  if (isLoading)
    return (
      <>
        {loading ?? (
          <div className="flex justify-center py-10">
            <Spinner size="h-6 w-6" />
          </div>
        )}
      </>
    );
  if (error) return <ErrorState error={error} onRetry={onRetry} />;
  if (isEmpty) return <>{empty}</>;
  return <>{children}</>;
}
