import type { Event, EventStatus } from "@/types";

/** Backend status is set by admins; fall back to dates so stale statuses still read correctly. */
export function effectiveStatus(event: Event, now = new Date()): EventStatus {
  const start = new Date(event.start_date);
  const end = new Date(event.end_date);
  if (end < now) return "COMPLETED";
  if (start <= now && now <= end) return "ONGOING";
  return event.status === "COMPLETED" ? "COMPLETED" : "UPCOMING";
}

export function upcomingEvents(events: Event[], now = new Date()) {
  return events
    .filter((e) => effectiveStatus(e, now) !== "COMPLETED")
    .sort((a, b) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime());
}

export function formatEventDate(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export const EVENT_STATUS_STYLES: Record<EventStatus, string> = {
  UPCOMING: "bg-primary/10 text-primary",
  ONGOING: "bg-success/10 text-success",
  COMPLETED: "bg-muted text-muted-foreground",
};
