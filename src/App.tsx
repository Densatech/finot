import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "@/context/AuthContext";
import { ConfirmProvider } from "@/components/ui/ConfirmDialog";
import ErrorBoundary from "@/components/ErrorBoundary";
import { queryClient } from "@/lib/queryClient";
import AppRoutes from "@/routes/AppRoutes";

export default function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <ConfirmProvider>
            <AppRoutes />
          </ConfirmProvider>
        </AuthProvider>
        <Toaster
          position="top-center"
          toastOptions={{
            duration: 4000,
            className: "text-sm",
            style: { borderRadius: "12px", background: "hsl(var(--card))", color: "hsl(var(--foreground))" },
          }}
        />
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
