import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import { Bars3Icon } from "@heroicons/react/24/outline";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import type { AuthUser } from "@/types";
import Avatar from "@/components/ui/Avatar";
import LanguageSelector from "@/components/ui/LanguageSelector";
import NotificationBell from "@/components/notifications/NotificationBell";

type DashboardTopNavProps = {
  user: AuthUser;
  onMenuClick: () => void;
  onLogout: () => void;
};

export default function DashboardTopNav({ user, onMenuClick, onLogout }: DashboardTopNavProps) {
  const { t } = useTranslation();
  const firstName = user.first_name || user.full_name.split(" ")[0];
  const profile = user.profile;
  const subtitle = [profile?.department, profile?.batch_year ? `${t("batch", "Batch")} ${profile.batch_year}` : null]
    .filter(Boolean)
    .join(" • ");

  return (
    <header className="sticky top-0 z-30 border-b-2 border-accent bg-card shadow-soft">
      <div className="flex h-16 items-center justify-between gap-3 px-4 md:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <button
            type="button"
            onClick={onMenuClick}
            className="rounded-lg p-2 text-muted-foreground hover:bg-muted md:hidden"
            aria-label={t("open_menu", "Open menu")}
          >
            <Bars3Icon className="h-6 w-6" />
          </button>
          <div className="hidden min-w-0 md:block">
            <p className="truncate text-sm font-semibold text-primary">
              {t("welcome_back", "Welcome back")}, {firstName}
            </p>
            {subtitle && <p className="truncate text-xs text-muted-foreground">{subtitle}</p>}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <LanguageSelector />
          <NotificationBell />
          <Menu as="div" className="relative">
            <MenuButton className="flex items-center gap-2 rounded-xl p-1 hover:bg-muted" aria-label={t("account_menu", "Account menu")}>
              <Avatar src={profile?.profile_image} alt={user.full_name} size="sm" />
              <span className="hidden max-w-[8rem] truncate text-sm font-medium text-foreground lg:block">{firstName}</span>
            </MenuButton>
            <MenuItems
              anchor={{ to: "bottom end", gap: 8 }}
              className="z-50 w-52 rounded-xl border border-border bg-card p-1 shadow-elevated focus:outline-none"
            >
              <div className="border-b border-border px-3 py-2">
                <p className="truncate text-sm font-medium text-foreground">{user.full_name}</p>
                <p className="truncate text-xs text-muted-foreground">{user.email}</p>
              </div>
              <MenuItem>
                <Link to="/dashboard/profile" className="mt-1 block rounded-lg px-3 py-2 text-sm text-foreground data-[focus]:bg-muted">
                  {t("view_profile", "View profile")}
                </Link>
              </MenuItem>
              <MenuItem>
                <Link to="/dashboard/profile/edit" className="block rounded-lg px-3 py-2 text-sm text-foreground data-[focus]:bg-muted">
                  {t("edit_profile", "Edit profile")}
                </Link>
              </MenuItem>
              <MenuItem>
                <button
                  type="button"
                  onClick={onLogout}
                  className="block w-full rounded-lg px-3 py-2 text-left text-sm text-destructive data-[focus]:bg-destructive/10"
                >
                  {t("logout")}
                </button>
              </MenuItem>
            </MenuItems>
          </Menu>
        </div>
      </div>
    </header>
  );
}
