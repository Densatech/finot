import type { ReactNode } from "react";

type CardProps = {
  children: ReactNode;
  className?: string;
  hoverable?: boolean;
  padding?: "sm" | "md" | "lg" | "none";
};

const PADDING = { none: "", sm: "p-3", md: "p-5", lg: "p-7" };

export const Card = ({ children, className = "", hoverable = false, padding = "md" }: CardProps) => (
  <div
    className={`rounded-2xl border border-border/70 bg-card shadow-card ${PADDING[padding]} ${
      hoverable ? "transition-colors hover:border-accent" : ""
    } ${className}`}
  >
    {children}
  </div>
);

/** Card heading with the yellow accent bar; optional link/action on the right. */
export const CardTitle = ({ children, action }: { children: ReactNode; action?: ReactNode }) => (
  <div className="mb-4 flex items-center justify-between gap-3">
    <h2 className="section-title">{children}</h2>
    {action}
  </div>
);

type StatsCardProps = {
  title: string;
  value: ReactNode;
  icon?: ReactNode;
  hint?: ReactNode;
  className?: string;
};

export const StatsCard = ({ title, value, icon, hint, className = "" }: StatsCardProps) => (
  <Card className={`flex items-center gap-4 border-l-4 border-l-accent ${className}`} padding="md">
    {icon && <div className="rounded-xl bg-primary p-3 text-accent">{icon}</div>}
    <div className="min-w-0">
      <p className="text-sm text-muted-foreground">{title}</p>
      <p className="truncate text-2xl font-bold text-primary">{value}</p>
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  </Card>
);

type SectionHeaderProps = {
  title: string;
  description?: string;
  action?: ReactNode;
  icon?: ReactNode;
  /** Small label above the title */
  eyebrow?: string;
};

/** Navy page header band used at the top of every dashboard page. */
export const SectionHeader = ({ title, description, action, icon, eyebrow }: SectionHeaderProps) => (
  <header className="page-hero">
    <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-3">
        {icon && <div className="rounded-xl bg-white/10 p-2.5 text-accent">{icon}</div>}
        <div>
          {eyebrow && <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-accent">{eyebrow}</p>}
          <h1 className="text-xl font-bold tracking-tight sm:text-2xl">{title}</h1>
          <span className="mt-2 block h-1 w-10 rounded-full bg-accent" aria-hidden="true" />
          {description && <p className="mt-2 max-w-2xl text-sm text-white/75">{description}</p>}
        </div>
      </div>
      {action && <div className="flex flex-wrap gap-2">{action}</div>}
    </div>
  </header>
);

export default Card;
