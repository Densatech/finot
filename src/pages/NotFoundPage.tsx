import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { MapIcon } from "@heroicons/react/24/outline";
import { FadeIn } from "@/components/motion";

export default function NotFoundPage() {
  const { t } = useTranslation();
  const { pathname } = useLocation();
  const inDashboard = pathname.startsWith("/dashboard");
  return (
    <FadeIn className="flex min-h-[60vh] flex-col items-center justify-center px-4 py-16 text-center">
      <span className="mb-4 rounded-full bg-accent/25 p-4 text-accent-foreground">
        <MapIcon className="h-8 w-8" aria-hidden="true" />
      </span>
      <p className="text-sm font-semibold text-primary/70">404</p>
      <h1 className="mt-1 text-2xl font-bold tracking-tight text-primary sm:text-3xl">{t("page_not_found", "Page not found")}</h1>
      <p className="mt-2 max-w-md text-muted-foreground">
        {t("page_not_found_desc", "The page you're looking for doesn't exist or has moved.")}
      </p>
      <Link to={inDashboard ? "/dashboard" : "/"} className="btn-primary mt-6">
        {inDashboard ? t("back_to_dashboard", "Back to dashboard") : t("back_to_home", "Back to home")}
      </Link>
    </FadeIn>
  );
}
