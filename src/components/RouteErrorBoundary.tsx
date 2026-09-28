import { Component, type ErrorInfo, type ReactNode } from "react";
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";

const RELOAD_FLAG = "finot.chunkReloaded";

function isChunkLoadError(error: Error) {
  return /Loading chunk|dynamically imported module|Importing a module script failed|error loading dynamically/i.test(error.message);
}

interface Props {
  children: ReactNode;
  /** Changing this (e.g. the pathname) clears the error so navigation recovers. */
  resetKey?: string;
}

/**
 * Catches rendering errors inside a layout so the rest of the app keeps working.
 * A failed lazy chunk (usually a stale tab after a new deploy) triggers one automatic reload.
 */
export default class RouteErrorBoundary extends Component<Props, { error: Error | null }> {
  state = { error: null as Error | null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    if (isChunkLoadError(error)) {
      try {
        if (!sessionStorage.getItem(RELOAD_FLAG)) {
          sessionStorage.setItem(RELOAD_FLAG, "1");
          window.location.reload();
          return;
        }
      } catch {
        /* storage unavailable: fall through to the error UI */
      }
    }
    console.error("Page error", error, info.componentStack);
  }

  componentDidUpdate(prev: Props) {
    if (this.state.error && prev.resetKey !== this.props.resetKey) this.setState({ error: null });
  }

  render() {
    if (!this.state.error) return this.props.children;
    return (
      <div className="flex min-h-[50vh] items-center justify-center p-6">
        <div className="max-w-md rounded-2xl border border-border bg-card p-8 text-center shadow-soft">
          <ExclamationTriangleIcon className="mx-auto h-10 w-10 text-warning" aria-hidden="true" />
          <h2 className="mt-3 text-lg font-semibold text-foreground">This page couldn't load</h2>
          <p className="mt-1 text-sm text-muted-foreground">Please try again. If it keeps happening, reload the app.</p>
          <div className="mt-5 flex justify-center gap-2">
            <button type="button" className="btn-outline" onClick={() => this.setState({ error: null })}>
              Try again
            </button>
            <button type="button" className="btn-primary" onClick={() => window.location.reload()}>
              Reload
            </button>
          </div>
        </div>
      </div>
    );
  }
}
