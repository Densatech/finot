import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "@/context/AuthContext";
import { ConfirmProvider } from "@/components/ui/ConfirmDialog";
import ErrorBoundary from "@/components/ErrorBoundary";
import { MotionProvider } from "@/components/motion";
import OfflineBanner from "@/components/OfflineBanner";
import { queryClient } from "@/lib/queryClient";
import AppRoutes from "@/routes/AppRoutes";

export default function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <MotionProvider>
          <AuthProvider>
            <ConfirmProvider>
              <OfflineBanner />
              <AppRoutes />
            </ConfirmProvider>
          </AuthProvider>
        </MotionProvider>
        <Toaster
          position="top-center"
          toastOptions={{
            duration: 4000,
            className: "text-sm",
            style: {
              borderRadius: "12px",
              background: "hsl(var(--card))",
              color: "hsl(var(--foreground))",
              border: "1px solid hsl(var(--border))",
              boxShadow: "0 16px 32px -8px rgb(16 24 40 / 0.16)",
            },
            success: { iconTheme: { primary: "hsl(152 60% 38%)", secondary: "#fff" } },
          }}
        />
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
