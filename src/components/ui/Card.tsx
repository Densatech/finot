import type { ReactNode } from "react";
import { CountUp } from "@/components/motion";

type CardProps = {
  children: ReactNode;
  className?: string;
  /** Lifts slightly with a yellow edge on hover — use for clickable cards. */
  interactive?: boolean;
  padding?: "sm" | "md" | "lg" | "none";
};

const PADDING = { none: "", sm: "p-3", md: "p-5", lg: "p-7" };

export const Card = ({ children, className = "", interactive = false, padding = "md" }: CardProps) => (
  <div className={`rounded-2xl border border-border bg-card shadow-soft ${PADDING[padding]} ${interactive ? "card-interactive" : ""} ${className}`}>
    {children}
  </div>
);

/** Card heading with an optional action (link/button) on the right. */
export const CardTitle = ({ children, description, action }: { children: ReactNode; description?: ReactNode; action?: ReactNode }) => (
  <div className="mb-4 flex items-start justify-between gap-3">
    <div>
      <h2 className="section-title">{children}</h2>
      {description && <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>}
    </div>
    {action}
  </div>
);

export type StatTone = "navy" | "yellow" | "green" | "rose";

const TONES: Record<StatTone, string> = {
  navy: "bg-primary/10 text-primary",
  yellow: "bg-accent/25 text-accent-foreground",
  green: "bg-success/10 text-success",
  rose: "bg-destructive/10 text-destructive",
};

type StatsCardProps = {
  title: string;
  value: number | string;
  suffix?: string;
  icon?: ReactNode;
  tone?: StatTone;
  hint?: ReactNode;
  className?: string;
};

export const StatsCard = ({ title, value, suffix, icon, tone = "navy", hint, className = "" }: StatsCardProps) => (
  <Card className={`card-interactive ${className}`}>
    <div className="flex items-start justify-between gap-3">
      <p className="text-sm font-medium text-muted-foreground">{title}</p>
      {icon && <span className={`rounded-xl p-2 ${TONES[tone]}`}>{icon}</span>}
    </div>
    <p className="mt-2 truncate text-2xl font-bold tracking-tight text-foreground">
      <CountUp value={value} suffix={suffix} />
    </p>
    {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
  </Card>
);

type SectionHeaderProps = {
  title: string;
  description?: string;
  action?: ReactNode;
  /** Small label above the title (e.g. context like a course's batch) */
  eyebrow?: string;
  /** Kept for API compatibility; not rendered. */
  icon?: ReactNode;
};

/** Page title row: clear heading, supporting text, actions on the right. */
export const SectionHeader = ({ title, description, action, eyebrow }: SectionHeaderProps) => (
  <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
    <div className="min-w-0">
      {eyebrow && <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-primary/70">{eyebrow}</p>}
      <h1 className="text-2xl font-bold tracking-tight text-primary">{title}</h1>
      {description && <p className="mt-1 max-w-2xl text-sm text-muted-foreground">{description}</p>}
    </div>
    {action && <div className="flex flex-shrink-0 flex-wrap gap-2">{action}</div>}
  </header>
);

export default Card;
