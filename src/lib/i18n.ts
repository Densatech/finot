import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import en from "../assets/locales/en.json";

export const LANGUAGES = ["en", "am", "om"] as const;

// English ships in the main bundle; Amharic and Afaan Oromo load only when selected.
const lazyLocales: Record<string, () => Promise<{ default: Record<string, unknown> }>> = {
  am: () => import("../assets/locales/am.json"),
  om: () => import("../assets/locales/om.json"),
};

async function ensureLanguage(lng: string) {
  const base = lng.split("-")[0];
  const loader = lazyLocales[base];
  if (loader && !i18n.hasResourceBundle(base, "translation")) {
    const mod = await loader();
    i18n.addResourceBundle(base, "translation", mod.default, true, true);
  }
}

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: { en: { translation: en } },
    supportedLngs: LANGUAGES as unknown as string[],
    nonExplicitSupportedLngs: true,
    fallbackLng: "en",
    partialBundledLanguages: true,
    interpolation: { escapeValue: false },
    detection: { order: ["localStorage", "navigator"], caches: ["localStorage"] },
  });

void ensureLanguage(i18n.language || "en").then(() => i18n.changeLanguage(i18n.language));

/** Use this instead of i18n.changeLanguage so the bundle is fetched first. */
export async function setLanguage(lng: string) {
  await ensureLanguage(lng);
  await i18n.changeLanguage(lng);
  document.documentElement.lang = lng;
}

export default i18n;
