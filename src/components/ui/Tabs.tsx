import { useId, type ReactNode } from "react";
import { m } from "@/components/motion";

export type TabItem<T extends string> = { id: T; label: ReactNode; count?: number; icon?: ReactNode };

interface TabsProps<T extends string> {
  items: TabItem<T>[];
  value: T;
  onChange: (id: NoInfer<T>) => void;
  label?: string;
}

/** Underline tabs; the yellow indicator slides to the active tab. */
export default function Tabs<T extends string>({ items, value, onChange, label }: TabsProps<T>) {
  const layoutId = useId();
  return (
    <div role="tablist" aria-label={label} className="flex gap-1 overflow-x-auto border-b border-border">
      {items.map((item) => {
        const active = value === item.id;
        return (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(item.id)}
            className={`relative inline-flex items-center gap-2 whitespace-nowrap px-4 pb-3 pt-2 text-sm font-medium transition-colors ${
              active ? "text-primary" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {item.icon}
            {item.label}
            {item.count !== undefined && (
              <span className={`rounded-full px-1.5 py-0.5 text-xs font-semibold ${active ? "bg-primary text-white" : "bg-muted text-muted-foreground"}`}>
                {item.count}
              </span>
            )}
            {active && (
              <m.span
                layoutId={`tab-indicator-${layoutId}`}
                className="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-accent"
                transition={{ type: "spring", stiffness: 500, damping: 40 }}
              />
            )}
          </button>
        );
      })}
    </div>
  );
}
