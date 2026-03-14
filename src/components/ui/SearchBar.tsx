import { useTranslation } from "react-i18next";

type Props = {
  value: string;
  onChange: (value: string) => void;
};

export default function SearchBar({ value, onChange }: Props) {
  const { t } = useTranslation();

  return (
    <div className="w-full">
      <input
        type="text"
        placeholder={t("search_placeholder") || "Search questions..."}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-2 rounded-lg bg-white border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#EDCF07] shadow-sm transition-shadow hover:shadow-md"
      />
    </div>
  );
}