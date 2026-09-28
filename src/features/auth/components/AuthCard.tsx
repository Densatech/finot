import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { fadeUp, m } from "@/components/motion";

interface AuthCardProps {
  title: string;
  subtitle?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
}

/** Login / register / password pages: a centred card on the light canvas. */
export default function AuthCard({ title, subtitle, children, footer }: AuthCardProps) {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-start justify-center bg-gradient-to-b from-primary/[0.05] to-background px-4 py-10 sm:items-center">
      <m.div initial="hidden" animate="visible" variants={fadeUp} className="w-full max-w-md">
        <div className="rounded-2xl border border-border bg-card p-6 shadow-card sm:p-8">
          <div className="mb-6 text-center">
            <Link to="/" className="mx-auto mb-4 inline-block">
              <img src="/images/logo-192.webp" alt="finot" className="mx-auto h-14 w-14" width={56} height={56} />
            </Link>
            <h1 className="text-2xl font-bold tracking-tight text-primary">{title}</h1>
            {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
          </div>
          {children}
        </div>
        {footer && <div className="mt-5 text-center text-sm text-muted-foreground">{footer}</div>}
      </m.div>
    </div>
  );
}
