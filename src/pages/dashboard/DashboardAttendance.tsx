import { useState } from "react";
import { useTranslation } from "react-i18next";
import Tabs from "@/components/ui/Tabs";
import { CheckCircleIcon } from "@heroicons/react/24/outline";
import { useMyAttendance } from "@/hooks/queries";
import { Card, SectionHeader, StatsCard } from "@/components/ui/Card";
import EmptyState from "@/components/ui/EmptyState";
import QueryState from "@/components/ui/QueryState";
import CourseAttendanceTab from "@/components/attendance/CourseAttendanceTab";
import type { ServiceAttendanceStatus } from "@/types";

const STATUS_STYLES: Record<ServiceAttendanceStatus, string> = {
  PRESENT: "bg-success/10 text-success",
  LATE: "bg-warning/15 text-warning",
  EXCUSED: "bg-primary/10 text-primary",
  ABSENT: "bg-destructive/10 text-destructive",
};

function EventAttendance() {
  const { t } = useTranslation();
  const { data: records = [], isLoading, error, refetch } = useMyAttendance();
  const attended = records.filter((r) => r.status === "PRESENT" || r.status === "LATE").length;

  return (
    <QueryState
      isLoading={isLoading}
      error={error}
      onRetry={refetch}
      isEmpty={records.length === 0}
      empty={
        <Card>
          <EmptyState
            icon={<CheckCircleIcon className="h-8 w-8" />}
            title={t("no_attendance_records", "No attendance records yet")}
            description={t("attendance_history_will_appear", "Your event attendance will appear here.")}
          />
        </Card>
      }
    >
      <div className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-3">
          <StatsCard title={t("total_events", "Events")} value={records.length} />
          <StatsCard title={t("present", "Attended")} value={attended} />
          <StatsCard title={t("attendance_rate", "Attendance rate")} value={`${Math.round((attended / records.length) * 100)}%`} />
        </div>
        <Card>
          <h2 className="section-title mb-3">{t("attendance_history", "Attendance history")}</h2>
          <ul className="divide-y divide-border">
            {records.map((r) => (
              <li key={r.id} className="flex items-center justify-between gap-3 py-2.5 text-sm">
                <div className="min-w-0">
                  <p className="truncate font-medium text-foreground">{r.event_title}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(r.event_date).toLocaleDateString()}
                    {r.remark ? ` · ${r.remark}` : ""}
                  </p>
                </div>
                <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${STATUS_STYLES[r.status]}`}>
                  {t(r.status.toLowerCase(), r.status)}
                </span>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </QueryState>
  );
}

export default function DashboardAttendance() {
  const { t } = useTranslation();
  const [tab, setTab] = useState<"events" | "courses">("events");

  return (
    <div className="space-y-6">
      <SectionHeader title={t("tab_attendance", "Attendance")} description={t("tracking_participation")} />
      <Tabs
        items={[
          { id: "events" as const, label: t("event_attendance", "Events") },
          { id: "courses" as const, label: t("course_attendance", "Courses") },
        ]}
        value={tab}
        onChange={setTab}
      />
      {tab === "events" ? <EventAttendance /> : <CourseAttendanceTab />}
    </div>
  );
}
