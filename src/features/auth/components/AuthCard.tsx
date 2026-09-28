import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { CheckCircleIcon } from "@heroicons/react/24/outline";

interface AuthCardProps {
  title: string;
  subtitle?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
}

/** Login / register / password pages: navy brand panel beside a white form card. */
export default function AuthCard({ title, subtitle, children, footer }: AuthCardProps) {
  const { t } = useTranslation();
  const points = [
    t("auth_point_family", "Find your spiritual family and service group"),
    t("auth_point_events", "Keep up with events, courses and attendance"),
    t("auth_point_qa", "Ask questions safely and give with confidence"),
  ];

  return (
    <div className="bg-background px-4 py-8 sm:py-12">
      <div className="mx-auto grid w-full max-w-5xl overflow-hidden rounded-3xl border border-border/70 bg-card shadow-elevated lg:grid-cols-2">
        <aside className="relative overflow-hidden bg-primary px-6 py-8 text-white sm:px-10 lg:py-12">
          <span className="pointer-events-none absolute -bottom-16 -right-16 h-56 w-56 rounded-full border-[24px] border-accent/15" aria-hidden="true" />
          <div className="relative flex items-center gap-3">
            <img src="/images/logo-192.webp" alt="" className="h-12 w-12" width={48} height={48} />
            <span className="text-3xl font-bold text-accent">finot</span>
          </div>
          <p className="relative mt-4 max-w-sm text-white/80">{t("fellowship_desc")}</p>
          <ul className="relative mt-8 hidden space-y-4 lg:block">
            {points.map((p) => (
              <li key={p} className="flex items-start gap-3 text-sm text-white/90">
                <CheckCircleIcon className="h-5 w-5 flex-shrink-0 text-accent" aria-hidden="true" />
                {p}
              </li>
            ))}
          </ul>
        </aside>

        <div className="px-6 py-8 sm:px-10 lg:py-12">
          <h1 className="text-2xl font-bold text-primary">{title}</h1>
          <span className="mt-2 block h-1 w-10 rounded-full bg-accent" aria-hidden="true" />
          {subtitle && <p className="mt-3 text-sm text-muted-foreground">{subtitle}</p>}
          <div className="mt-6">{children}</div>
          {footer && <div className="mt-6 border-t border-border pt-5 text-center text-sm text-muted-foreground">{footer}</div>}
        </div>
      </div>
    </div>
  );
}
