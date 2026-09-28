import { useTranslation } from "react-i18next";
import { AcademicCapIcon } from "@heroicons/react/24/outline";
import { useMyCourseAttendance } from "@/hooks/queries";
import { Card, StatsCard } from "@/components/ui/Card";
import EmptyState from "@/components/ui/EmptyState";
import QueryState from "@/components/ui/QueryState";
import type { CourseAttendanceStatus } from "@/types";

const STATUS_STYLES: Record<CourseAttendanceStatus, string> = {
  PRESENT: "bg-success/10 text-success",
  ABSENT: "bg-destructive/10 text-destructive",
  EXCUSED: "bg-warning/15 text-warning",
};

/** A student's own course attendance, grouped by course. */
export default function CourseAttendanceTab() {
  const { t } = useTranslation();
  const { data: records = [], isLoading, error, refetch } = useMyCourseAttendance();

  const byCourse = new Map<string, { title: string; present: number; total: number }>();
  records.forEach((r) => {
    const entry = byCourse.get(r.semester_course) ?? { title: r.course_title, present: 0, total: 0 };
    entry.total += 1;
    if (r.status === "PRESENT") entry.present += 1;
    byCourse.set(r.semester_course, entry);
  });
  const present = records.filter((r) => r.status === "PRESENT").length;
  const sorted = [...records].sort((a, b) => b.session_date.localeCompare(a.session_date));

  return (
    <QueryState
      isLoading={isLoading}
      error={error}
      onRetry={refetch}
      isEmpty={records.length === 0}
      empty={
        <Card>
          <EmptyState
            icon={<AcademicCapIcon className="h-8 w-8" />}
            title={t("no_attendance_records", "No attendance records yet")}
            description={t("course_attendance_empty", "Once your course coordinator takes attendance, it shows up here.")}
          />
        </Card>
      }
    >
      <div className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-3">
          <StatsCard title={t("sessions", "Sessions")} value={records.length} />
          <StatsCard title={t("present", "Present")} value={present} />
          <StatsCard title={t("attendance_rate", "Attendance rate")} value={`${Math.round((present / records.length) * 100)}%`} />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {[...byCourse.entries()].map(([id, c]) => (
            <Card key={id}>
              <p className="font-semibold text-foreground">{c.title}</p>
              <p className="text-sm text-muted-foreground">
                {c.present}/{c.total} {t("present", "present")}
              </p>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted">
                <div className="h-full rounded-full bg-primary" style={{ width: `${(c.present / c.total) * 100}%` }} />
              </div>
            </Card>
          ))}
        </div>

        <Card>
          <h2 className="section-title mb-3">{t("attendance_history", "Attendance history")}</h2>
          <ul className="divide-y divide-border">
            {sorted.map((r) => (
              <li key={r.id} className="flex items-center justify-between gap-3 py-2.5 text-sm">
                <div className="min-w-0">
                  <p className="truncate font-medium text-foreground">{r.course_title}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(r.session_date).toLocaleDateString()}
                    {r.session_topic ? ` · ${r.session_topic}` : ""}
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
