import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig(({ mode, command }) => {
  const env = loadEnv(mode, process.cwd(), "");

  if (command === "build" && mode === "production" && !env.VITE_API_URL) {
    throw new Error("VITE_API_URL must be set for production builds (e.g. https://finot.onrender.com).");
  }

  // Local backend by default; set VITE_DEV_API_PROXY to use another one.
  const proxyTarget = env.VITE_DEV_API_PROXY || "http://localhost:8000";

  return {
    plugins: [react()],
    resolve: {
      alias: { "@": path.resolve(__dirname, "./src") },
    },
    server: {
      port: 5176,
      proxy: {
        "/auth": { target: proxyTarget, changeOrigin: true },
        "/api": { target: proxyTarget, changeOrigin: true },
      },
    },
    build: {
      target: "es2020",
      rollupOptions: {
        output: {
          // Stable vendor chunks cache well across deploys.
          manualChunks(id) {
            if (!id.includes("node_modules")) return undefined;
            if (/node_modules\/(react|react-dom|scheduler|react-router|react-router-dom)\//.test(id)) return "react";
            if (id.includes("@tanstack") || id.includes("axios")) return "query";
            if (id.includes("i18next")) return "i18n";
            if (id.includes("@headlessui") || id.includes("@floating-ui") || id.includes("@react-aria") || id.includes("tabbable")) return "ui";
            if (id.includes("@heroicons")) return "icons";
            if (id.includes("firebase") || id.includes("@firebase") || id.includes("idb")) return "firebase";
            if (id.includes("react-hot-toast") || id.includes("goober")) return "ui";
            return "vendor";
          },
        },
      },
    },
  };
});
