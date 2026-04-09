import { ReactNode, useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { api } from "../../lib/api";
import { Card, SectionHeader, StatsCard } from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import EmptyState from "../../components/ui/EmptyState";
import { useTranslation } from "react-i18next";
import { AttendanceRecord } from "../../types";
import {
  FiCheckCircle,
  FiCalendar,
  FiTrendingUp,
  FiAward,
  FiBookOpen,
  FiMapPin,
  FiLayers,
} from "react-icons/fi";

type AttendanceEventMeta = {
  id: number;
  title?: string;
  start_date?: string;
  place_name?: string;
  status?: string;
  service_group_name?: string | null;
};

type AttendanceWithMeta = AttendanceRecord & {
  eventMeta?: AttendanceEventMeta;
  attendanceType: "course" | "event";
};

const statusStyles: Record<string, string> = {
  PRESENT: "success",
  ABSENT: "destructive",
  LATE: "warning",
  EXCUSED: "default",
};

const DashboardAttendance = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [attendance, setAttendance] = useState<AttendanceWithMeta[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        const [attendanceData, eventData] = await Promise.all([
          api.getAttendance(),
          api.getEvents(),
        ]);

        const eventsById = new Map<number, AttendanceEventMeta>(
          (eventData || []).map((event: AttendanceEventMeta) => [event.id, event]),
        );

        const enrichedAttendance = (attendanceData || []).map((record: AttendanceRecord) => {
          const eventMeta = eventsById.get(Number(record.event));
          return {
            ...record,
            eventMeta,
            attendanceType: eventMeta?.service_group_name ? "course" : "event",
          } as AttendanceWithMeta;
        });

        setAttendance(enrichedAttendance);
      } catch (error) {
        console.error("Failed to fetch attendance", error);
      } finally {
        setLoading(false);
      }
    };

    if (user) fetchAttendance();
  }, [user]);

  const presentCount = attendance.filter((a) => a.status === "PRESENT").length;
  const lateCount = attendance.filter((a) => a.status === "LATE").length;
  const attendanceRate =
    attendance.length > 0 ? Math.round((presentCount / attendance.length) * 100) : 0;

  const courseAttendance = attendance.filter((record) => record.attendanceType === "course");
  const eventAttendance = attendance.filter((record) => record.attendanceType === "event");

  const formatDate = (dateValue?: string) => {
    if (!dateValue) return "—";
    return new Date(dateValue).toLocaleDateString();
  };

  const AttendanceSection = ({
    title,
    description,
    records,
    emptyTitle,
    emptyDescription,
    icon,
  }: {
    title: string;
    description: string;
    records: AttendanceWithMeta[];
    emptyTitle: string;
    emptyDescription: string;
    icon: ReactNode;
  }) => (
    <Card>
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h3 className="text-base font-medium text-foreground">{title}</h3>
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        </div>
        <div className="text-primary">{icon}</div>
      </div>

      {records.length === 0 ? (
        <EmptyState icon={icon} title={emptyTitle} description={emptyDescription} />
      ) : (
        <div className="space-y-3">
          {records.map((record) => (
            <div
              key={record.id}
              className="rounded-2xl border border-border bg-muted/20 p-4"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold text-foreground">
                      {record.event_title || record.eventMeta?.title || "Event"}
                    </p>
                    <Badge variant={statusStyles[record.status] as any} size="sm">
                      {t(`status_${record.status.toLowerCase()}`, {
                        defaultValue: record.status,
                      })}
                    </Badge>
                  </div>

                  <div className="mt-2 flex flex-col gap-1 text-sm text-muted-foreground">
                    <p className="flex items-center gap-2">
                      <FiCalendar className="h-4 w-4" />
                      {formatDate(record.event_date || record.eventMeta?.start_date)}
                    </p>

                    {record.eventMeta?.service_group_name && (
                      <p className="flex items-center gap-2">
                        <FiLayers className="h-4 w-4" />
                        {record.eventMeta.service_group_name}
                      </p>
                    )}

                    {record.eventMeta?.place_name && (
                      <p className="flex items-center gap-2">
                        <FiMapPin className="h-4 w-4" />
                        {record.eventMeta.place_name}
                      </p>
                    )}

                    {record.remark && <p>{record.remark}</p>}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="skeleton h-24 rounded-2xl" />
          ))}
        </div>
        <div className="grid gap-4 xl:grid-cols-2">
          {[1, 2].map((i) => (
            <div key={i} className="skeleton h-72 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <SectionHeader
        title={t("tab_attendance")}
        description={t("tracking_participation")}
        icon={<FiCheckCircle className="h-6 w-6" />}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title={t("attendance_rate")}
          value={`${attendanceRate}%`}
          icon={<FiTrendingUp className="h-6 w-6" />}
          trend={{ value: 5, positive: true }}
        />
        <StatsCard
          title={t("present")}
          value={presentCount}
          icon={<FiCheckCircle className="h-6 w-6" />}
        />
        <StatsCard
          title={t("course_attendance", "Course Attendance")}
          value={courseAttendance.length}
          icon={<FiBookOpen className="h-6 w-6" />}
        />
        <StatsCard
          title={t("event_attendance", "Event Attendance")}
          value={eventAttendance.length}
          icon={<FiAward className="h-6 w-6" />}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <AttendanceSection
          title={t("course_attendance", "Course Attendance")}
          description={t(
            "course_attendance_desc",
            "Attendance related to your assigned service group sessions.",
          )}
          records={courseAttendance}
          emptyTitle={t("no_course_attendance", "No Course Attendance")}
          emptyDescription={t(
            "no_course_attendance_desc",
            "Your service group attendance records will appear here.",
          )}
          icon={<FiBookOpen className="h-5 w-5" />}
        />

        <AttendanceSection
          title={t("event_attendance", "Event Attendance")}
          description={t(
            "event_attendance_desc",
            "General fellowship events with date, location, and status.",
          )}
          records={eventAttendance}
          emptyTitle={t("no_event_attendance", "No Event Attendance")}
          emptyDescription={t(
            "no_event_attendance_desc",
            "Your general event attendance records will appear here.",
          )}
          icon={<FiCalendar className="h-5 w-5" />}
        />
      </div>

      {attendance.length === 0 && (
        <Card>
          <EmptyState
            icon={<FiCheckCircle className="h-8 w-8" />}
            title={t("no_attendance_records")}
            description={t("attendance_history_will_appear")}
          />
        </Card>
      )}

      {attendance.length > 0 && (
        <Card>
          <h3 className="mb-4 text-base font-medium text-foreground">
            {t("attendance_summary", "Attendance Summary")}
          </h3>
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-xl bg-muted/40 p-4">
              <p className="text-sm text-muted-foreground">
                {t("total_records", "Total Records")}
              </p>
              <p className="mt-2 text-2xl font-semibold text-foreground">
                {attendance.length}
              </p>
            </div>
            <div className="rounded-xl bg-muted/40 p-4">
              <p className="text-sm text-muted-foreground">{t("late")}</p>
              <p className="mt-2 text-2xl font-semibold text-foreground">{lateCount}</p>
            </div>
            <div className="rounded-xl bg-muted/40 p-4">
              <p className="text-sm text-muted-foreground">
                {t("total_events", "Total Events")}
              </p>
              <p className="mt-2 text-2xl font-semibold text-foreground">
                {eventAttendance.length}
              </p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default DashboardAttendance;
