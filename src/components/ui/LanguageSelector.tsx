import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import { CheckIcon, ChevronDownIcon, LanguageIcon } from "@heroicons/react/24/outline";
import { useTranslation } from "react-i18next";
import { setLanguage } from "@/lib/i18n";

const languages = [
  { code: "en", name: "English" },
  { code: "am", name: "አማርኛ" },
  { code: "om", name: "Afaan Oromoo" },
];

interface LanguageSelectorProps {
  /** "hero" = light text on the navy hero, "nav" = regular. */
  variant?: "hero" | "nav";
}

export default function LanguageSelector({ variant = "nav" }: LanguageSelectorProps) {
  const { i18n } = useTranslation();
  const current = languages.find((l) => i18n.language?.startsWith(l.code)) ?? languages[0];

  return (
    <Menu as="div" className="relative">
      <MenuButton
        className={`flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-medium transition-colors ${
          variant === "hero"
            ? "border border-white/30 text-white hover:bg-white/10"
            : "border border-border bg-card text-foreground hover:bg-muted"
        }`}
        aria-label="Change language"
      >
        <LanguageIcon className="h-4 w-4" aria-hidden="true" />
        <span className="hidden sm:inline">{current.name}</span>
        <span className="sm:hidden">{current.code.toUpperCase()}</span>
        <ChevronDownIcon className="h-4 w-4" aria-hidden="true" />
      </MenuButton>
      <MenuItems
        anchor={{ to: "bottom end", gap: 8 }}
        transition className="z-50 w-44 rounded-xl border border-border bg-card p-1 shadow-elevated focus:outline-none transition origin-top-right duration-150 ease-out data-[closed]:scale-95 data-[closed]:opacity-0"
      >
        {languages.map((lang) => (
          <MenuItem key={lang.code}>
            <button
              type="button"
              onClick={() => void setLanguage(lang.code)}
              className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm text-foreground data-[focus]:bg-muted"
            >
              {lang.name}
              {current.code === lang.code && <CheckIcon className="h-4 w-4 text-primary" aria-hidden="true" />}
            </button>
          </MenuItem>
        ))}
      </MenuItems>
    </Menu>
  );
}
