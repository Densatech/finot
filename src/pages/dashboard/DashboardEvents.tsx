import { useState } from "react";
import { Stagger, StaggerItem } from "@/components/motion";
import { useTranslation } from "react-i18next";
import { CalendarDaysIcon, ClockIcon, MapPinIcon } from "@heroicons/react/24/outline";
import { useEvents } from "@/hooks/queries";
import { Card, SectionHeader } from "@/components/ui/Card";
import EmptyState from "@/components/ui/EmptyState";
import FilterBar from "@/components/ui/FilterBar";
import QueryState from "@/components/ui/QueryState";
import { EVENT_STATUS_STYLES, effectiveStatus, formatEventDate } from "@/features/events/eventUtils";

type Filter = "upcoming" | "completed" | "all";

export default function DashboardEvents() {
  const { t } = useTranslation();
  const { data: events = [], isLoading, error, refetch } = useEvents();
  const [filter, setFilter] = useState<Filter>("upcoming");

  const now = new Date();
  const withStatus = events.map((e) => ({ event: e, status: effectiveStatus(e, now) }));
  const filtered = withStatus
    .filter(({ status }) =>
      filter === "all" ? true : filter === "completed" ? status === "COMPLETED" : status !== "COMPLETED",
    )
    .sort((a, b) =>
      filter === "completed"
        ? new Date(b.event.start_date).getTime() - new Date(a.event.start_date).getTime()
        : new Date(a.event.start_date).getTime() - new Date(b.event.start_date).getTime(),
    );

  return (
    <div className="space-y-6">
      <SectionHeader title={t("events", "Events")} description={t("events_description")} />
      <FilterBar
        value={filter}
        onChange={(v) => setFilter(v as Filter)}
        options={[
          { value: "upcoming", label: t("upcoming_events", "Upcoming") },
          { value: "completed", label: t("event_completed", "Past") },
          { value: "all", label: t("all_events", "All") },
        ]}
      />
      <QueryState
        isLoading={isLoading}
        error={error}
        onRetry={refetch}
        loading={
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="skeleton h-56" />
            ))}
          </div>
        }
        isEmpty={filtered.length === 0}
        empty={
          <Card>
            <EmptyState
              icon={<CalendarDaysIcon className="h-8 w-8" />}
              title={t("no_events_found", "No events")}
              description={t("events_check_back", "Check back later for new events.")}
            />
          </Card>
        }
      >
        <Stagger as="ul" className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map(({ event, status }) => (
            <StaggerItem as="li" key={event.id}>
              <Card padding="none" interactive className="group flex h-full flex-col overflow-hidden">
                {event.photo && (
                  <div className="h-40 overflow-hidden"><img src={event.photo} alt="" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" decoding="async" /></div>
                )}
                <div className="flex flex-1 flex-col gap-2 p-5">
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span className={`rounded-full px-2.5 py-0.5 font-semibold ${EVENT_STATUS_STYLES[status]}`}>
                      {t(`event_${status.toLowerCase()}`, status)}
                    </span>
                    <span className="rounded-full bg-muted px-2.5 py-0.5 font-medium text-muted-foreground">
                      {event.service_group_name ?? t("general", "General")}
                    </span>
                  </div>
                  <h2 className="font-semibold text-foreground">{event.title}</h2>
                  <p className="line-clamp-3 text-sm text-muted-foreground">{event.description}</p>
                  <div className="mt-auto space-y-1 pt-2 text-sm text-muted-foreground">
                    <p className="flex items-center gap-1.5">
                      <ClockIcon className="h-4 w-4" aria-hidden="true" />
                      {formatEventDate(event.start_date)}
                    </p>
                    <p className="flex items-center gap-1.5">
                      <MapPinIcon className="h-4 w-4" aria-hidden="true" />
                      {event.place_url ? (
                        <a href={event.place_url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                          {event.place_name || t("view_location", "View location")}
                        </a>
                      ) : (
                        event.place_name || t("location_tbd", "Location TBD")
                      )}
                    </p>
                  </div>
                </div>
              </Card>
            </StaggerItem>
          ))}
        </Stagger>
      </QueryState>
    </div>
  );
}
