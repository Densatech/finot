import { useState } from "react";
import { Dialog, DialogPanel } from "@headlessui/react";
import { Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useUnreadCount } from "@/hooks/queries";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import DashboardTopNav from "@/components/dashboard/DashboardTopNav";
import ProfileCompletionBanner from "@/components/dashboard/ProfileCompletionBanner";

const COLLAPSE_KEY = "finot.sidebarCollapsed";

export default function DashboardLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { data: unreadCount = 0 } = useUnreadCount();
  const [collapsed, setCollapsed] = useState(() => {
    try {
      return localStorage.getItem(COLLAPSE_KEY) === "1";
    } catch {
      return false;
    }
  });
  const [mobileOpen, setMobileOpen] = useState(false);

  // ProtectedRoute guarantees a user here.
  if (!user) return null;

  const toggleCollapsed = () => {
    setCollapsed((prev) => {
      try {
        localStorage.setItem(COLLAPSE_KEY, prev ? "0" : "1");
      } catch {
        /* ignore */
      }
      return !prev;
    });
  };

  const handleLogout = async () => {
    setMobileOpen(false);
    await logout();
    navigate("/", { replace: true });
  };

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <DashboardSidebar
        collapsed={collapsed}
        onToggle={toggleCollapsed}
        onLogout={handleLogout}
        unreadCount={unreadCount}
        user={user}
        className="hidden md:flex"
      />

      {/* Mobile drawer: focus-trapped, closes on Escape or backdrop tap. */}
      <Dialog open={mobileOpen} onClose={setMobileOpen} className="relative z-50 md:hidden">
        <div className="fixed inset-0 bg-foreground/40" aria-hidden="true" />
        <DialogPanel className="fixed inset-y-0 left-0 flex w-[80vw] max-w-[280px]">
          <DashboardSidebar
            collapsed={false}
            onToggle={() => setMobileOpen(false)}
            onLogout={handleLogout}
            unreadCount={unreadCount}
            user={user}
            onNavClick={() => setMobileOpen(false)}
            showCollapseToggle={false}
            className="flex w-full"
          />
        </DialogPanel>
      </Dialog>

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <DashboardTopNav user={user} onMenuClick={() => setMobileOpen(true)} onLogout={handleLogout} />
        <main id="dashboard-main-scroll" className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          <div className="mx-auto max-w-7xl space-y-6">
            <ProfileCompletionBanner />
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
