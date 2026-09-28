import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
// Self-hosted font (latin subset, only the weights we use): no third-party request, no render-blocking CSS.
import "@fontsource/plus-jakarta-sans/latin-400.css";
import "@fontsource/plus-jakarta-sans/latin-500.css";
import "@fontsource/plus-jakarta-sans/latin-600.css";
import "@fontsource/plus-jakarta-sans/latin-700.css";
import "./assets/styles/global.css";
import "./lib/i18n";

// A successful start clears the one-shot "reload after stale chunk" guard (see RouteErrorBoundary).
window.setTimeout(() => {
  try {
    sessionStorage.removeItem("finot.chunkReloaded");
  } catch {
    /* ignore */
  }
}, 10_000);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
