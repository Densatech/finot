import { Suspense } from "react";
import { useLocation } from "react-router-dom";
import Navbar from "@/components/navigation/Navbar";
import Footer from "@/components/navigation/Footer";
import PageLoader from "@/components/ui/PageLoader";
import RouteErrorBoundary from "@/components/RouteErrorBoundary";
import { AnimatedOutlet } from "@/components/motion";

/** Public pages share one navbar and footer; pages load and animate inside it. */
export default function MainLayout() {
  const { pathname } = useLocation();
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />
      <main className="flex-grow">
        <RouteErrorBoundary resetKey={pathname}>
          <Suspense fallback={<PageLoader />}>
            <AnimatedOutlet />
          </Suspense>
        </RouteErrorBoundary>
      </main>
      <Footer />
    </div>
  );
}
