import type { ReactNode } from "react";

type EmptyStateProps = {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
};

const EmptyState = ({ icon, title, description, action }: EmptyStateProps) => (
  <div className="flex flex-col items-center justify-center px-4 py-10 text-center">
    {icon && <div className="mb-4 rounded-2xl bg-accent/25 p-4 text-primary">{icon}</div>}
    <h3 className="mb-1 text-base font-semibold text-primary">{title}</h3>
    {description && <p className="mb-5 max-w-sm text-sm text-muted-foreground">{description}</p>}
    {action}
  </div>
);

export default EmptyState;
