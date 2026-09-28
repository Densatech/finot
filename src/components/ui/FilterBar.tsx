type Option = { value: string; label: string };

type FilterBarProps = {
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  label?: string;
};

/** Pill-style single-choice filter. */
export default function FilterBar({ options, value, onChange, label = "Filter" }: FilterBarProps) {
  return (
    <div role="radiogroup" aria-label={label} className="flex flex-wrap gap-2">
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <button
            key={opt.value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(opt.value)}
            className={`rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors ${
              active ? "border-primary bg-primary text-white" : "border-border bg-card text-foreground hover:bg-muted"
            }`}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
