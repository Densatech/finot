import { useState } from "react";
import { Stagger, StaggerItem } from "@/components/motion";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { BellAlertIcon, BellIcon } from "@heroicons/react/24/outline";
import { useNotifications, useUnreadCount } from "@/hooks/queries";
import { usePushNotifications } from "@/hooks/usePushNotifications";
import { notificationApi } from "@/lib/api";
import { notificationTarget } from "@/lib/notifications";
import { Card, SectionHeader } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import EmptyState from "@/components/ui/EmptyState";
import Pagination from "@/components/ui/Pagination";
import QueryState from "@/components/ui/QueryState";
import type { AppNotification } from "@/types";

const PAGE_SIZE = 20;

export default function DashboardNotifications() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const { data, isLoading, error, refetch, isFetching } = useNotifications(page);
  const { data: unread = 0 } = useUnreadCount();
  const push = usePushNotifications();

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["notifications"] });
  const markRead = useMutation({ mutationFn: notificationApi.markRead, onSuccess: invalidate });
  const markAll = useMutation({ mutationFn: notificationApi.markAllRead, onSuccess: invalidate });

  const open = (n: AppNotification) => {
    if (!n.is_read) markRead.mutate(n.id);
    const target = notificationTarget(n);
    if (target !== "/dashboard/notifications") navigate(target);
  };

  return (
    <div className="space-y-6">
      <SectionHeader
        title={t("notifications", "Notifications")}
        description={unread ? t("unread_count", "{{count}} unread", { count: unread }) : t("all_caught_up", "You're all caught up.")}
        action={
          unread > 0 ? (
            <Button variant="outline" loading={markAll.isPending} onClick={() => markAll.mutate()}>
              {t("mark_all_read", "Mark all as read")}
            </Button>
          ) : undefined
        }
      />

      {push.state === "default" && (
        <Card className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <BellAlertIcon className="h-7 w-7 flex-shrink-0 text-primary" aria-hidden="true" />
          <p className="flex-1 text-sm text-foreground">
            {t("enable_push_prompt", "Get notified on this device about new events, donation receipts and answers to your private questions.")}
          </p>
          <Button variant="secondary" loading={push.busy} onClick={push.enable}>
            {t("enable_push", "Enable notifications")}
          </Button>
        </Card>
      )}
      {push.state === "denied" && (
        <p className="text-sm text-muted-foreground">
          {t("push_blocked", "Notifications are blocked for this site in your browser settings.")}
        </p>
      )}

      <Card padding="none">
        <QueryState
          isLoading={isLoading}
          error={error}
          onRetry={refetch}
          isEmpty={!data?.results.length}
          empty={<EmptyState icon={<BellIcon className="h-8 w-8" />} title={t("no_notifications", "No notifications")} description={t("notifications_empty", "Updates from the fellowship will appear here.")} />}
        >
          <Stagger as="ul" className={`divide-y divide-border ${isFetching ? "opacity-70" : ""}`}>
            {data?.results.map((n) => (
              <StaggerItem as="li" key={n.id}>
                <button
                  type="button"
                  onClick={() => open(n)}
                  className={`flex w-full gap-3 px-5 py-4 text-left hover:bg-muted ${n.is_read ? "" : "bg-primary/5"}`}
                >
                  <span className={`mt-1.5 h-2 w-2 flex-shrink-0 rounded-full ${n.is_read ? "bg-transparent" : "bg-primary"}`} aria-hidden="true" />
                  <span className="min-w-0 flex-1">
                    <span className={`block ${n.is_read ? "text-foreground/85" : "font-semibold text-foreground"}`}>{n.title}</span>
                    <span className="mt-0.5 block text-sm text-muted-foreground">{n.message}</span>
                    <span className="mt-1 block text-xs text-muted-foreground">{new Date(n.created_at).toLocaleString()}</span>
                  </span>
                </button>
              </StaggerItem>
            ))}
          </Stagger>
        </QueryState>
      </Card>
      <Pagination page={page} totalPages={Math.ceil((data?.count ?? 0) / PAGE_SIZE)} onPageChange={setPage} />
    </div>
  );
}
