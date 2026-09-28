import { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { AnimatePresence } from "framer-motion";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
import { useAuth } from "@/context/AuthContext";
import { useScrolled } from "@/hooks/useScrolled";
import { m } from "@/components/motion";
import LanguageSelector from "@/components/ui/LanguageSelector";

export default function Navbar() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { pathname } = useLocation();
  const scrolled = useScrolled(undefined, 20);
  const [open, setOpen] = useState(false);

  useEffect(() => setOpen(false), [pathname]);

  // On the homepage the bar sits on the navy hero until the user scrolls.
  const onHero = pathname === "/" && !scrolled && !open;

  const links = [
    { to: "/about", label: t("about") },
    { to: "/donate", label: t("donate") },
    { to: "/anonymous", label: t("anonymous_qa") },
    { to: "/contact", label: t("contact") },
  ];

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `relative rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
      onHero
        ? isActive
          ? "text-accent"
          : "text-white/85 hover:text-white"
        : isActive
          ? "text-primary"
          : "text-foreground/75 hover:bg-muted hover:text-primary"
    }`;

  return (
    <m.header
      initial={{ y: -16, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4 }}
      className={`sticky top-0 z-40 transition-[background-color,box-shadow,border-color] duration-300 ${
        onHero ? "border-b border-transparent bg-primary" : "border-b border-border bg-card shadow-soft"
      }`}
    >
      <nav className="container mx-auto flex h-16 items-center justify-between px-4" aria-label="Main">
        <Link to="/" className="group flex items-center gap-2">
          <img
            src="/images/logo-192.webp"
            alt=""
            className="h-9 w-9 transition-transform duration-300 group-hover:scale-105"
            width={36}
            height={36}
          />
          <span className={`text-xl font-bold transition-colors ${onHero ? "text-white" : "text-primary"}`}>finot</span>
        </Link>

        <div className="hidden items-center gap-1 md:flex">
          {links.map((l) => (
            <NavLink key={l.to} to={l.to} className={linkClass}>
              {({ isActive }) => (
                <>
                  {l.label}
                  {isActive && (
                    <m.span layoutId="navbar-active" className="absolute inset-x-3 -bottom-0.5 h-0.5 rounded-full bg-accent" />
                  )}
                </>
              )}
            </NavLink>
          ))}
        </div>

        <div className="hidden items-center gap-2 md:flex">
          <LanguageSelector variant={onHero ? "hero" : "nav"} />
          {user ? (
            <Link to="/dashboard" className="btn-primary">
              {t("dashboard", "Dashboard")}
            </Link>
          ) : (
            <>
              <Link
                to="/login"
                className={`rounded-xl px-4 py-2 text-sm font-semibold transition-colors ${
                  onHero ? "text-white hover:bg-white/10" : "text-primary hover:bg-primary/5"
                }`}
              >
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
          className={`rounded-lg p-2 md:hidden ${onHero ? "text-white hover:bg-white/10" : "text-foreground hover:bg-muted"}`}
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
        >
          {open ? <XMarkIcon className="h-6 w-6" /> : <Bars3Icon className="h-6 w-6" />}
        </button>
      </nav>

      <AnimatePresence initial={false}>
        {open && (
          <m.div
            key="mobile-menu"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden border-t border-border bg-card md:hidden"
          >
            <div className="container mx-auto flex flex-col gap-1 px-4 py-3">
              {links.map((l) => (
                <NavLink
                  key={l.to}
                  to={l.to}
                  className={({ isActive }) =>
                    `rounded-lg px-3 py-2.5 text-sm font-medium ${isActive ? "bg-primary/5 text-primary" : "text-foreground hover:bg-muted"}`
                  }
                >
                  {l.label}
                </NavLink>
              ))}
              <div className="mt-2 flex gap-2 border-t border-border pt-3">
                {user ? (
                  <Link to="/dashboard" className="btn-primary flex-1">
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
          </m.div>
        )}
      </AnimatePresence>
    </m.header>
  );
}
