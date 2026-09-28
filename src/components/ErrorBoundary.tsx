import { Component, type ErrorInfo, type ReactNode } from "react";

interface State {
  error: Error | null;
}

/** Last line of defence: a rendering bug shows a recovery screen instead of a blank page. */
export default class ErrorBoundary extends Component<{ children: ReactNode }, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("Unhandled UI error", error, info.componentStack);
  }

  render() {
    if (!this.state.error) return this.props.children;
    // A stale chunk after a deploy is the most common cause; a reload fixes it.
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-6">
        <div className="card max-w-md text-center">
          <h1 className="text-lg font-semibold text-foreground">Something went wrong</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            The page failed to load. Reloading usually fixes it.
          </p>
          <div className="mt-5 flex justify-center gap-3">
            <button type="button" className="btn-primary" onClick={() => window.location.reload()}>
              Reload
            </button>
            <a href="/" className="btn-outline">
              Home
            </a>
          </div>
        </div>
      </div>
    );
  }
}
