import { Popover, PopoverButton, PopoverPanel } from "@headlessui/react";
import { BellIcon } from "@heroicons/react/24/outline";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";
import { notificationApi } from "@/lib/api";
import { notificationTarget } from "@/lib/notifications";
import { useNotifications, useUnreadCount } from "@/hooks/queries";
import type { AppNotification } from "@/types";
import Spinner from "@/components/ui/Spinner";

export function NotificationBell() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: unread = 0 } = useUnreadCount();
  const { data, isLoading } = useNotifications(1);
  const latest = data?.results.slice(0, 6) ?? [];

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["notifications"] });
  const markRead = useMutation({ mutationFn: notificationApi.markRead, onSuccess: invalidate });
  const markAll = useMutation({ mutationFn: notificationApi.markAllRead, onSuccess: invalidate });

  const open = (n: AppNotification, close: () => void) => {
    if (!n.is_read) markRead.mutate(n.id);
    close();
    navigate(notificationTarget(n));
  };

  return (
    <Popover className="relative">
      <PopoverButton
        className="relative rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
        aria-label={unread ? `${t("notifications")} (${unread})` : t("notifications")}
      >
        <BellIcon className="h-6 w-6" />
        {unread > 0 && (
          <span className="absolute right-1 top-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold text-white">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </PopoverButton>

      <PopoverPanel
        anchor={{ to: "bottom end", gap: 8 }}
        transition className="z-50 w-[min(20rem,calc(100vw-2rem))] overflow-hidden rounded-xl border border-border bg-card shadow-elevated transition origin-top-right duration-150 ease-out data-[closed]:scale-95 data-[closed]:opacity-0"
      >
        {({ close }) => (
          <>
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <h3 className="text-sm font-semibold text-foreground">{t("notifications")}</h3>
              {unread > 0 && (
                <button
                  type="button"
                  onClick={() => markAll.mutate()}
                  disabled={markAll.isPending}
                  className="text-xs font-medium text-primary hover:underline disabled:opacity-60"
                >
                  {t("mark_all_read")}
                </button>
              )}
            </div>
            <div className="max-h-96 overflow-y-auto">
              {isLoading ? (
                <div className="flex justify-center p-6">
                  <Spinner />
                </div>
              ) : latest.length === 0 ? (
                <p className="p-6 text-center text-sm text-muted-foreground">{t("no_notifications")}</p>
              ) : (
                <ul className="divide-y divide-border">
                  {latest.map((n) => (
                    <li key={n.id}>
                      <button
                        type="button"
                        onClick={() => open(n, close)}
                        className={`flex w-full gap-3 px-4 py-3 text-left hover:bg-muted ${n.is_read ? "" : "bg-primary/5"}`}
                      >
                        <span
                          className={`mt-1.5 h-2 w-2 flex-shrink-0 rounded-full ${n.is_read ? "bg-transparent" : "bg-primary"}`}
                          aria-hidden="true"
                        />
                        <span className="min-w-0 flex-1">
                          <span className={`block text-sm ${n.is_read ? "text-foreground/80" : "font-semibold text-foreground"}`}>
                            {n.title}
                          </span>
                          <span className="mt-0.5 line-clamp-2 block text-xs text-muted-foreground">{n.message}</span>
                          <span className="mt-1 block text-[11px] text-muted-foreground">
                            {new Date(n.created_at).toLocaleString()}
                          </span>
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <Link
              to="/dashboard/notifications"
              onClick={() => close()}
              className="block border-t border-border px-4 py-2.5 text-center text-sm font-medium text-primary hover:bg-muted"
            >
              {t("view_all", "View all")}
            </Link>
          </>
        )}
      </PopoverPanel>
    </Popover>
  );
}

export default NotificationBell;
