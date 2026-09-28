import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  ArrowRightIcon,
  BriefcaseIcon,
  CalendarDaysIcon,
  ChatBubbleLeftRightIcon,
  ChartBarIcon,
  HeartIcon,
  MapPinIcon,
  UserGroupIcon,
} from "@heroicons/react/24/outline";
import { useAuth } from "@/context/AuthContext";
import { useEvents, useMyAttendance, useMyFamily } from "@/hooks/queries";
import { Card, CardTitle, StatsCard } from "@/components/ui/Card";
import QueryState from "@/components/ui/QueryState";
import EmptyState from "@/components/ui/EmptyState";
import Avatar from "@/components/ui/Avatar";
import { FadeIn, Stagger, StaggerItem } from "@/components/motion";
import { EVENT_STATUS_STYLES, effectiveStatus, formatEventDate, upcomingEvents } from "@/features/events/eventUtils";
import type { FamilyContact } from "@/types";

function ViewAll({ to, label }: { to: string; label: string }) {
  return (
    <Link to={to} className="group inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline">
      {label}
      <ArrowRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
    </Link>
  );
}

function Mentor({ label, person, fallback }: { label: string; person: FamilyContact | null; fallback: string }) {
  return (
    <div className="flex items-center gap-3">
      <Avatar alt={person?.name ?? "?"} size="md" />
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="truncate text-sm font-medium text-foreground">{person?.name ?? fallback}</p>
      </div>
    </div>
  );
}

export default function DashboardOverview() {
  const { t } = useTranslation();
  const { user } = useAuth();
  // Independent queries run in parallel and are cached for the other dashboard pages.
  const events = useEvents();
  const family = useMyFamily();
  const attendance = useMyAttendance();

  const upcoming = upcomingEvents(events.data ?? []);
  const records = attendance.data ?? [];
  const attended = records.filter((r) => r.status === "PRESENT" || r.status === "LATE").length;
  const rate = records.length ? Math.round((attended / records.length) * 100) : null;

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? t("good_morning", "Good morning") : hour < 18 ? t("good_afternoon", "Good afternoon") : t("good_evening", "Good evening");

  const quickActions = [
    { to: "/dashboard/donations/give", label: t("make_donation", "Make a donation"), desc: t("support_fellowship", "Support the fellowship"), icon: HeartIcon, tone: "bg-rose-50 text-rose-600" },
    { to: "/dashboard/questions", label: t("qa_forum", "Q&A forum"), desc: t("ask_safely", "Ask anonymously"), icon: ChatBubbleLeftRightIcon, tone: "bg-primary/10 text-primary" },
    { to: "/dashboard/service", label: t("service_groups", "Service groups"), desc: t("ministry_opportunities", "Find your ministry"), icon: BriefcaseIcon, tone: "bg-amber-50 text-amber-600" },
    { to: "/dashboard/events", label: t("view_events", "View events"), desc: t("events_description", "What's coming up"), icon: CalendarDaysIcon, tone: "bg-emerald-50 text-emerald-600" },
  ];

  return (
    <div className="space-y-6">
      <FadeIn className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight text-primary sm:text-3xl">
          {greeting}, {user?.first_name}
        </h1>
        <p className="text-sm text-muted-foreground">
          {user?.membership
            ? t("serving_in", "Serving in {{group}}", { group: user.membership.service_group_name })
            : t("overview_intro", "Here's what's happening in your fellowship.")}
        </p>
      </FadeIn>

      <Stagger className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StaggerItem>
          <StatsCard title={t("upcoming_events", "Upcoming events")} value={events.isLoading ? "–" : upcoming.length} icon={<CalendarDaysIcon className="h-5 w-5" />} tone="yellow" />
        </StaggerItem>
        <StaggerItem>
          <StatsCard
            title={t("attendance_rate", "Attendance rate")}
            value={attendance.isLoading || rate === null ? "–" : rate}
            suffix={rate === null ? "" : "%"}
            icon={<ChartBarIcon className="h-5 w-5" />}
            tone="navy"
          />
        </StaggerItem>
        <StaggerItem>
          <StatsCard
            title={t("family_members", "Family members")}
            value={family.isLoading ? "–" : family.data ? family.data.member_count : 0}
            icon={<UserGroupIcon className="h-5 w-5" />}
            tone="green"
          />
        </StaggerItem>
        <StaggerItem>
          <StatsCard
            title={t("service_group", "Service group")}
            value={user?.membership?.service_group_name ?? t("not_assigned", "Not assigned")}
            icon={<BriefcaseIcon className="h-5 w-5" />}
            tone="rose"
          />
        </StaggerItem>
      </Stagger>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardTitle description={t("upcoming_events_desc", "Events for you and your group")} action={<ViewAll to="/dashboard/events" label={t("view_all", "View all")} />}>
              {t("upcoming_events", "Upcoming events")}
            </CardTitle>
            <QueryState
              isLoading={events.isLoading}
              error={events.error}
              onRetry={events.refetch}
              loading={<div className="space-y-3">{[1, 2].map((i) => <div key={i} className="skeleton h-20" />)}</div>}
              isEmpty={upcoming.length === 0}
              empty={<EmptyState icon={<CalendarDaysIcon className="h-6 w-6" />} title={t("no_upcoming_events", "No upcoming events")} description={t("events_check_back", "Check back later.")} />}
            >
              <Stagger as="ul" className="space-y-3">
                {upcoming.slice(0, 3).map((event) => {
                  const status = effectiveStatus(event);
                  const start = new Date(event.start_date);
                  return (
                    <StaggerItem as="li" key={event.id}>
                      <Link to="/dashboard/events" className="card-interactive flex items-start gap-4 rounded-xl border border-border p-4">
                        <div className="flex w-12 flex-shrink-0 flex-col items-center rounded-lg bg-primary/5 py-1.5 text-primary">
                          <span className="text-[10px] font-semibold uppercase">{start.toLocaleDateString(undefined, { month: "short" })}</span>
                          <span className="text-lg font-bold leading-none">{start.getDate()}</span>
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="truncate font-semibold text-foreground">{event.title}</p>
                            <span className={`rounded-md px-1.5 py-0.5 text-[10px] font-semibold uppercase ${EVENT_STATUS_STYLES[status]}`}>
                              {t(`event_${status.toLowerCase()}`, status)}
                            </span>
                          </div>
                          <p className="mt-0.5 text-sm text-muted-foreground">{formatEventDate(event.start_date)}</p>
                          {event.place_name && (
                            <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                              <MapPinIcon className="h-3.5 w-3.5" aria-hidden="true" />
                              {event.place_name}
                            </p>
                          )}
                        </div>
                      </Link>
                    </StaggerItem>
                  );
                })}
              </Stagger>
            </QueryState>
          </Card>

          <Card>
            <CardTitle action={<ViewAll to="/dashboard/attendance" label={t("view_all", "View all")} />}>
              {t("recent_attendance", "Recent attendance")}
            </CardTitle>
            <QueryState
              isLoading={attendance.isLoading}
              error={attendance.error}
              onRetry={attendance.refetch}
              loading={<div className="skeleton h-24" />}
              isEmpty={records.length === 0}
              empty={<p className="py-6 text-center text-sm text-muted-foreground">{t("no_attendance_records", "No attendance records yet.")}</p>}
            >
              <ul className="divide-y divide-border">
                {records.slice(0, 5).map((r) => (
                  <li key={r.id} className="flex items-center justify-between gap-3 py-2.5 text-sm">
                    <span className="min-w-0 truncate text-foreground">{r.event_title}</span>
                    <span className="whitespace-nowrap text-muted-foreground">
                      {new Date(r.event_date).toLocaleDateString()} · {t(r.status.toLowerCase(), r.status)}
                    </span>
                  </li>
                ))}
              </ul>
            </QueryState>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardTitle action={<ViewAll to="/dashboard/family" label={t("view_all", "View all")} />}>{t("my_family", "My family")}</CardTitle>
            <QueryState
              isLoading={family.isLoading}
              error={family.error}
              onRetry={family.refetch}
              loading={<div className="skeleton h-32" />}
              isEmpty={!family.data}
              empty={<EmptyState icon={<UserGroupIcon className="h-6 w-6" />} title={t("no_family_assigned", "No family yet")} description={t("no_family_yet", "You'll see your family once you're assigned.")} />}
            >
              {family.data && (
                <div className="space-y-4">
                  <p className="font-semibold text-foreground">{family.data.name}</p>
                  <Mentor label={t("spiritual_father", "Spiritual father")} person={family.data.father} fallback={t("tbd", "Not assigned yet")} />
                  <Mentor label={t("spiritual_mother", "Spiritual mother")} person={family.data.mother} fallback={t("tbd", "Not assigned yet")} />
                  <p className="text-xs text-muted-foreground">
                    {t("siblings_count", { count: family.data.siblings.length })}
                  </p>
                </div>
              )}
            </QueryState>
          </Card>

          <Card>
            <CardTitle>{t("quick_actions", "Quick actions")}</CardTitle>
            <Stagger as="ul" className="space-y-1">
              {quickActions.map((a) => (
                <StaggerItem as="li" key={a.to}>
                  <Link to={a.to} className="group flex items-center gap-3 rounded-xl p-2 transition-colors hover:bg-muted">
                    <span className={`rounded-lg p-2 ${a.tone}`}>
                      <a.icon className="h-5 w-5" aria-hidden="true" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-medium text-foreground">{a.label}</span>
                      <span className="block truncate text-xs text-muted-foreground">{a.desc}</span>
                    </span>
                    <ArrowRightIcon className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
                  </Link>
                </StaggerItem>
              ))}
            </Stagger>
          </Card>
        </div>
      </div>
    </div>
  );
}
