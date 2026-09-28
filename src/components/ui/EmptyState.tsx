import type { ReactNode } from "react";
import { FadeIn } from "@/components/motion";

type EmptyStateProps = {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
};

const EmptyState = ({ icon, title, description, action }: EmptyStateProps) => (
  <FadeIn className="flex flex-col items-center justify-center px-4 py-12 text-center">
    {icon && <div className="mb-4 rounded-full bg-muted p-4 text-muted-foreground">{icon}</div>}
    <h3 className="mb-1 text-base font-semibold text-foreground">{title}</h3>
    {description && <p className="mb-5 max-w-sm text-sm text-muted-foreground">{description}</p>}
    {action}
  </FadeIn>
);

export default EmptyState;
