import type { AppNotification } from "@/types";

/** Where a notification should take the user inside the dashboard. */
export function notificationTarget(n: Pick<AppNotification, "notification_type">): string {
  switch (n.notification_type) {
    case "QA":
      return "/dashboard/questions?tab=private";
    case "EVENT":
      return "/dashboard/events";
    case "DONATION":
    case "REMINDER":
      return "/dashboard/donations";
    default:
      return "/dashboard/notifications";
  }
}
