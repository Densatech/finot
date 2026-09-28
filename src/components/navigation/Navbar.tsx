import { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
import { useAuth } from "@/context/AuthContext";
import LanguageSelector from "@/components/ui/LanguageSelector";

export default function Navbar() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);

  useEffect(() => setOpen(false), [pathname]);

  const links = [
    { to: "/about", label: t("about") },
    { to: "/donate", label: t("donate") },
    { to: "/anonymous", label: t("anonymous_qa") },
    { to: "/contact", label: t("contact") },
  ];

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
      isActive ? "text-primary bg-primary/5" : "text-foreground/80 hover:text-primary hover:bg-muted"
    }`;

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-card">
      <nav className="container mx-auto flex h-16 items-center justify-between px-4" aria-label="Main">
        <Link to="/" className="flex items-center gap-2">
          <img src="/images/logo-192.webp" alt="" className="h-9 w-9" width={36} height={36} />
          <span className="text-xl font-bold text-primary">finot</span>
        </Link>

        <div className="hidden items-center gap-1 md:flex">
          {links.map((l) => (
            <NavLink key={l.to} to={l.to} className={linkClass}>
              {l.label}
            </NavLink>
          ))}
        </div>

        <div className="hidden items-center gap-2 md:flex">
          <LanguageSelector />
          {user ? (
            <Link to="/dashboard" className="btn-secondary">
              {t("dashboard", "Dashboard")}
            </Link>
          ) : (
            <>
              <Link to="/login" className="rounded-xl px-4 py-2 text-sm font-semibold text-primary hover:bg-primary/5">
                {t("sign_in")}
              </Link>
              <Link to="/register" className="btn-primary">
                {t("sign_up")}
              </Link>
            </>
          )}
        </div>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="rounded-lg p-2 text-foreground hover:bg-muted md:hidden"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
        >
          {open ? <XMarkIcon className="h-6 w-6" /> : <Bars3Icon className="h-6 w-6" />}
        </button>
      </nav>

      {open && (
        <div className="border-t border-border bg-card md:hidden">
          <div className="container mx-auto flex flex-col gap-1 px-4 py-3">
            {links.map((l) => (
              <NavLink key={l.to} to={l.to} className={linkClass}>
                {l.label}
              </NavLink>
            ))}
            <div className="mt-2 flex gap-2 border-t border-border pt-3">
              {user ? (
                <Link to="/dashboard" className="btn-secondary flex-1">
                  {t("dashboard", "Dashboard")}
                </Link>
              ) : (
                <>
                  <Link to="/login" className="btn-outline flex-1">
                    {t("sign_in")}
                  </Link>
                  <Link to="/register" className="btn-primary flex-1">
                    {t("sign_up")}
                  </Link>
                </>
              )}
            </div>
            <div className="pt-2">
              <LanguageSelector />
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
