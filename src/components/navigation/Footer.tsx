import { EnvelopeIcon, MapPinIcon, PhoneIcon } from "@heroicons/react/24/outline";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { SITE } from "@/config/site";

export default function Footer() {
  const { t } = useTranslation();
  const year = new Date().getFullYear();

  const links = [
    { to: "/about", label: t("about") },
    { to: "/register", label: t("get_started") },
    { to: "/donate", label: t("donate") },
    { to: "/anonymous", label: t("anonymous_qa") },
    { to: "/contact", label: t("contact") },
  ];

  return (
    <footer className="bg-primary pb-8 pt-12 text-primary-foreground">
      <div className="container mx-auto px-4">
        <div className="mb-10 grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <img src="/images/logo-192.webp" alt="" className="h-8 w-8" width={32} height={32} loading="lazy" />
              <span className="text-2xl font-bold text-accent">finot</span>
            </div>
            <p className="text-sm leading-relaxed text-white/75">{t("contact_desc")}</p>
          </div>

          <div className="space-y-3">
            <h2 className="text-base font-semibold text-accent">{t("quick_links")}</h2>
            <ul className="space-y-2 text-sm">
              {links.map((l) => (
                <li key={l.to}>
                  <Link to={l.to} className="text-white/75 hover:text-accent">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-3">
            <h2 className="text-base font-semibold text-accent">{t("contact")}</h2>
            <ul className="space-y-2.5 text-sm text-white/75">
              <li className="flex items-center gap-3">
                <EnvelopeIcon className="h-4 w-4 flex-shrink-0 text-accent" aria-hidden="true" />
                <a href={`mailto:${SITE.email}`} className="hover:text-accent">
                  {SITE.email}
                </a>
              </li>
              <li className="flex items-center gap-3">
                <PhoneIcon className="h-4 w-4 flex-shrink-0 text-accent" aria-hidden="true" />
                <a href={`tel:${SITE.phone.replace(/\s/g, "")}`} className="hover:text-accent">
                  {SITE.phone}
                </a>
              </li>
              <li className="flex items-center gap-3">
                <MapPinIcon className="h-4 w-4 flex-shrink-0 text-accent" aria-hidden="true" />
                <span>{SITE.location}</span>
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            <h2 className="text-base font-semibold text-accent">{t("follow_us")}</h2>
            <ul className="flex flex-wrap gap-2">
              {SITE.socials.map((s) => (
                <li key={s.label}>
                  <a
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block rounded-lg border border-white/20 px-3 py-1.5 text-sm text-white/80 hover:border-accent hover:text-accent"
                  >
                    {s.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 pt-6 text-center text-sm text-white/60">
          <p>
            &copy; {year} finot. {t("all_rights_reserved")}
          </p>
        </div>
      </div>
    </footer>
  );
}
