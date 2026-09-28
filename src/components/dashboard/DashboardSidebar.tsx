import type { ComponentType, SVGProps } from "react";
import { useTranslation } from "react-i18next";
import { NavLink } from "react-router-dom";
import {
  AcademicCapIcon,
  ArrowRightStartOnRectangleIcon,
  BellIcon,
  BriefcaseIcon,
  CalendarDaysIcon,
  ChatBubbleLeftRightIcon,
  CheckCircleIcon,
  ChevronDoubleLeftIcon,
  ChevronDoubleRightIcon,
  Cog6ToothIcon,
  DocumentTextIcon,
  HeartIcon,
  MegaphoneIcon,
  ShieldCheckIcon,
  Squares2X2Icon,
  UserCircleIcon,
  UserGroupIcon,
} from "@heroicons/react/24/outline";
import { can } from "@/lib/roles";
import { ROLES, type AuthUser, type RoleName } from "@/types";

type NavItem = {
  to: string;
  label: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  end?: boolean;
  badge?: number;
  roles?: RoleName[];
};

type DashboardSidebarProps = {
  collapsed: boolean;
  onToggle: () => void;
  onLogout: () => void;
  unreadCount: number;
  user: AuthUser;
  className?: string;
  onNavClick?: () => void;
  showCollapseToggle?: boolean;
};

const DashboardSidebar = ({
  collapsed,
  onToggle,
  onLogout,
  unreadCount,
  user,
  className = "",
  onNavClick,
  showCollapseToggle = true,
}: DashboardSidebarProps) => {
  const { t } = useTranslation();

  const items: NavItem[] = [
    { to: "/dashboard", label: t("tab_overview"), icon: Squares2X2Icon, end: true },
    { to: "/dashboard/profile", label: t("profile"), icon: UserCircleIcon },
    { to: "/dashboard/notifications", label: t("notifications"), icon: BellIcon, badge: unreadCount },
    { to: "/dashboard/events", label: t("tab_events"), icon: CalendarDaysIcon },
    { to: "/dashboard/attendance", label: t("tab_attendance"), icon: CheckCircleIcon },
    { to: "/dashboard/family", label: t("tab_family"), icon: UserGroupIcon },
    { to: "/dashboard/service", label: t("tab_groups"), icon: BriefcaseIcon },
    { to: "/dashboard/questions", label: t("qa"), icon: ChatBubbleLeftRightIcon },
    { to: "/dashboard/donations", label: t("donation"), icon: HeartIcon },
    { to: "/dashboard/resources", label: t("resources"), icon: DocumentTextIcon },
    { to: "/dashboard/manage-ageglot", label: t("manage_ageglot"), icon: Cog6ToothIcon, roles: [ROLES.SERVICE_ADMIN] },
    { to: "/dashboard/event-management", label: t("event_management"), icon: MegaphoneIcon, roles: [ROLES.EVENT_MANAGER] },
    { to: "/dashboard/courses", label: t("course_coordinator"), icon: AcademicCapIcon, roles: [ROLES.COURSE_COORDINATOR] },
    { to: "/dashboard/counselor/queue", label: t("counselor_queue"), icon: ChatBubbleLeftRightIcon, roles: [ROLES.QA_COUNSELOR] },
    { to: "/dashboard/counselor/approve", label: t("moderator_queue"), icon: ShieldCheckIcon, roles: [ROLES.QA_MODERATOR] },
  ];
  const navItems = items.filter((item) => !item.roles || can(user, ...item.roles));

  return (
    <aside
      className={`${className} ${collapsed ? "w-20" : "w-64"} h-full flex-col bg-primary transition-[width] duration-200`}
      aria-label={t("dashboard", "Dashboard")}
    >
      <div className={`flex items-center border-b border-white/10 p-4 ${collapsed ? "justify-center" : "justify-between"}`}>
        {!collapsed && (
          <NavLink to="/" className="flex items-center gap-2" onClick={onNavClick}>
            <img src="/images/logo-192.webp" alt="" className="h-8 w-8" width={32} height={32} />
            <span className="text-lg font-bold text-accent">finot</span>
          </NavLink>
        )}
        {showCollapseToggle && (
          <button
            type="button"
            onClick={onToggle}
            className="rounded-lg p-1.5 text-white/70 hover:bg-white/10 hover:text-white"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? <ChevronDoubleRightIcon className="h-5 w-5" /> : <ChevronDoubleLeftIcon className="h-5 w-5" />}
          </button>
        )}
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            onClick={onNavClick}
            title={collapsed ? item.label : undefined}
            className={({ isActive }) =>
              `relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors ${
                collapsed ? "justify-center" : ""
              } ${isActive ? "bg-accent font-semibold text-primary" : "text-white/80 hover:bg-white/10 hover:text-white"}`
            }
          >
            <item.icon className="h-5 w-5 flex-shrink-0" aria-hidden="true" />
            {!collapsed && <span className="flex-1 truncate">{item.label}</span>}
            {(item.badge ?? 0) > 0 &&
              (collapsed ? (
                <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-destructive" aria-label={`${item.badge} unread`} />
              ) : (
                <span className="min-w-[20px] rounded-full bg-destructive px-1.5 text-center text-xs font-semibold text-white">
                  {item.badge! > 99 ? "99+" : item.badge}
                </span>
              ))}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-white/10 p-3">
        <button
          type="button"
          onClick={onLogout}
          title={collapsed ? t("logout") : undefined}
          className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-white/75 hover:bg-white/10 hover:text-white ${
            collapsed ? "justify-center" : ""
          }`}
        >
          <ArrowRightStartOnRectangleIcon className="h-5 w-5 flex-shrink-0" aria-hidden="true" />
          {!collapsed && <span>{t("logout")}</span>}
        </button>
      </div>
    </aside>
  );
};

export default DashboardSidebar;
