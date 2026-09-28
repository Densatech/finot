import type { ReactNode } from "react";

export type TabItem<T extends string> = { id: T; label: ReactNode; count?: number };

interface TabsProps<T extends string> {
  items: TabItem<T>[];
  value: T;
  onChange: (id: T) => void;
  label?: string;
}

/** Segmented tabs: the active tab is Finot navy. */
export default function Tabs<T extends string>({ items, value, onChange, label }: TabsProps<T>) {
  return (
    <div role="tablist" aria-label={label} className="tabs">
      {items.map((item) => (
        <button
          key={item.id}
          type="button"
          role="tab"
          aria-selected={value === item.id}
          onClick={() => onChange(item.id)}
          className="tab"
        >
          {item.label}
          {item.count !== undefined && (
            <span
              className={`ml-2 rounded-full px-1.5 py-0.5 text-xs font-semibold ${
                value === item.id ? "bg-accent text-accent-foreground" : "bg-muted text-muted-foreground"
              }`}
            >
              {item.count}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}
