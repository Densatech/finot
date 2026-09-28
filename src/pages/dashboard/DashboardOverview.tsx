import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  BriefcaseIcon,
  CalendarDaysIcon,
  ChatBubbleLeftRightIcon,
  CheckCircleIcon,
  HeartIcon,
  MapPinIcon,
  UserGroupIcon,
} from "@heroicons/react/24/outline";
import { useAuth } from "@/context/AuthContext";
import { useEvents, useMyAttendance, useMyFamily } from "@/hooks/queries";
import { Card, StatsCard } from "@/components/ui/Card";
import QueryState from "@/components/ui/QueryState";
import { formatEventDate, upcomingEvents } from "@/features/events/eventUtils";

function CardTitle({ children, to, linkLabel }: { children: string; to?: string; linkLabel?: string }) {
  return (
    <div className="mb-3 flex items-center justify-between">
      <h2 className="section-title">{children}</h2>
      {to && (
        <Link to={to} className="text-sm font-medium text-primary hover:underline">
          {linkLabel}
        </Link>
      )}
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

  const quickActions = [
    { to: "/dashboard/donations/give", label: t("make_donation", "Make a donation"), icon: HeartIcon },
    { to: "/dashboard/events", label: t("view_events", "View events"), icon: CalendarDaysIcon },
    { to: "/dashboard/questions", label: t("qa_forum", "Q&A forum"), icon: ChatBubbleLeftRightIcon },
    { to: "/dashboard/service", label: t("service_group", "Service groups"), icon: BriefcaseIcon },
  ];

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? t("good_morning", "Good morning") : hour < 18 ? t("good_afternoon", "Good afternoon") : t("good_evening", "Good evening");

  return (
    <div className="space-y-6">
      <header className="page-hero">
        <div className="relative z-10 space-y-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-accent">{t("dashboard", "Dashboard")}</p>
            <h1 className="mt-1 text-2xl font-bold sm:text-3xl">
              {greeting}, {user?.first_name}
            </h1>
            <span className="mt-2 block h-1 w-10 rounded-full bg-accent" aria-hidden="true" />
            <p className="mt-2 text-sm text-white/75">
              {user?.membership
                ? t("serving_in", "Serving in {{group}}", { group: user.membership.service_group_name })
                : t("overview_intro", "Here's what's happening in your fellowship.")}
            </p>
          </div>
          <nav className="flex flex-wrap gap-2" aria-label={t("quick_actions", "Quick actions")}>
            {quickActions.map((a, i) => (
              <Link
                key={a.to}
                to={a.to}
                className={
                  i === 0
                    ? "btn-primary"
                    : "inline-flex items-center gap-2 rounded-xl border border-white/30 px-4 py-2.5 text-sm font-semibold text-white hover:bg-white/10"
                }
              >
                <a.icon className="h-5 w-5" aria-hidden="true" />
                {a.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatsCard
          title={t("upcoming_events", "Upcoming events")}
          value={events.isLoading ? "…" : upcoming.length}
          icon={<CalendarDaysIcon className="h-6 w-6" />}
        />
        <StatsCard
          title={t("attendance_rate", "Attendance rate")}
          value={attendance.isLoading ? "…" : rate === null ? "—" : `${rate}%`}
          icon={<CheckCircleIcon className="h-6 w-6" />}
        />
        <StatsCard
          title={t("service_group", "Service group")}
          value={<span className="text-lg">{user?.membership?.service_group_name ?? t("not_assigned", "Not assigned")}</span>}
          icon={<BriefcaseIcon className="h-6 w-6" />}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardTitle to="/dashboard/events" linkLabel={t("view_events", "View events")}>
            {t("upcoming_events", "Upcoming events")}
          </CardTitle>
          <QueryState
            isLoading={events.isLoading}
            error={events.error}
            onRetry={events.refetch}
            isEmpty={upcoming.length === 0}
            empty={<p className="py-6 text-center text-sm text-muted-foreground">{t("no_upcoming_events", "No upcoming events.")}</p>}
          >
            <ul className="divide-y divide-border">
              {upcoming.slice(0, 4).map((event) => (
                <li key={event.id} className="flex items-start gap-3 py-3">
                  <span className="rounded-xl bg-primary/10 p-2.5 text-primary">
                    <CalendarDaysIcon className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <div className="min-w-0">
                    <p className="truncate font-medium text-foreground">{event.title}</p>
                    <p className="text-sm text-muted-foreground">{formatEventDate(event.start_date)}</p>
                    {event.place_name && (
                      <p className="flex items-center gap-1 text-xs text-muted-foreground">
                        <MapPinIcon className="h-3.5 w-3.5" aria-hidden="true" />
                        {event.place_name}
                      </p>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </QueryState>
        </Card>

        <Card>
          <CardTitle to="/dashboard/family" linkLabel={t("tab_family", "Family")}>
            {t("my_family", "My family")}
          </CardTitle>
          <QueryState
            isLoading={family.isLoading}
            error={family.error}
            onRetry={family.refetch}
            isEmpty={!family.data}
            empty={
              <div className="py-6 text-center">
                <UserGroupIcon className="mx-auto mb-2 h-8 w-8 text-muted-foreground" aria-hidden="true" />
                <p className="text-sm text-muted-foreground">{t("no_family_yet", "You haven't been assigned to a family yet.")}</p>
              </div>
            }
          >
            {family.data && (
              <dl className="space-y-2 text-sm">
                <div>
                  <dt className="text-muted-foreground">{t("family", "Family")}</dt>
                  <dd className="font-semibold text-foreground">{family.data.name}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">{t("spiritual_father", "Spiritual father")}</dt>
                  <dd className="font-medium text-foreground">{family.data.father?.name ?? t("tbd", "TBD")}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">{t("spiritual_mother", "Spiritual mother")}</dt>
                  <dd className="font-medium text-foreground">{family.data.mother?.name ?? t("tbd", "TBD")}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">{t("siblings_count", "Siblings")}</dt>
                  <dd className="font-medium text-foreground">{family.data.siblings.length}</dd>
                </div>
              </dl>
            )}
          </QueryState>
        </Card>
      </div>

      <div>
        <Card>
          <CardTitle to="/dashboard/attendance" linkLabel={t("tab_attendance", "Attendance")}>
            {t("recent_attendance", "Recent attendance")}
          </CardTitle>
          <QueryState
            isLoading={attendance.isLoading}
            error={attendance.error}
            onRetry={attendance.refetch}
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
    </div>
  );
}
