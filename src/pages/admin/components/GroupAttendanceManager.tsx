import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { UsersIcon } from "@heroicons/react/24/outline";
import { useEvents, useGroupRoster } from "@/hooks/queries";
import { serviceApi } from "@/lib/api";
import { getErrorMessage } from "@/lib/errors";
import type { ServiceAttendanceStatus } from "@/types";
import { Card } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import EmptyState from "@/components/ui/EmptyState";
import QueryState from "@/components/ui/QueryState";
import { SelectField } from "@/components/ui/Field";
import { formatEventDate } from "@/features/events/eventUtils";

const STATUSES: ServiceAttendanceStatus[] = ["PRESENT", "LATE", "EXCUSED", "ABSENT"];

type Mark = { status: ServiceAttendanceStatus; remark: string };

/** A ServiceAdmin marks attendance for events of the group they manage. */
export default function GroupAttendanceManager({ groupId }: { groupId: number }) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const events = useEvents();
  const roster = useGroupRoster();
  const groupEvents = useMemo(
    () =>
      (events.data ?? [])
        .filter((e) => e.service_group === groupId)
        .sort((a, b) => new Date(b.start_date).getTime() - new Date(a.start_date).getTime()),
    [events.data, groupId],
  );

  const [eventId, setEventId] = useState<number | null>(null);
  const [marks, setMarks] = useState<Record<number, Mark>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (eventId === null && groupEvents.length) setEventId(groupEvents[0].id);
  }, [eventId, groupEvents]);

  const existing = useQuery({
    queryKey: ["service", "event-records", eventId],
    queryFn: () => serviceApi.eventAttendance(eventId!),
    enabled: eventId !== null,
  });

  // Start from saved marks; students without one default to PRESENT.
  useEffect(() => {
    if (!roster.data || !existing.data) return;
    const saved = new Map(existing.data.map((r) => [r.student_id, r]));
    setMarks(
      Object.fromEntries(
        roster.data.map((s) => {
          const r = saved.get(s.id);
          return [s.id, { status: r?.status ?? "PRESENT", remark: r?.remark ?? "" }];
        }),
      ),
    );
  }, [roster.data, existing.data]);

  const setAll = (status: ServiceAttendanceStatus) =>
    setMarks((prev) => Object.fromEntries(Object.entries(prev).map(([id, m]) => [id, { ...m, status }])));

  const save = async () => {
    if (eventId === null) return;
    setSaving(true);
    try {
      await serviceApi.markAttendance(
        eventId,
        Object.entries(marks).map(([id, m]) => ({ student_id: Number(id), status: m.status, remark: m.remark.trim() })),
      );
      await queryClient.invalidateQueries({ queryKey: ["service", "event-records", eventId] });
      toast.success(t("attendance_recorded_success", "Attendance saved."));
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <QueryState
      isLoading={events.isLoading || roster.isLoading}
      error={events.error || roster.error}
      onRetry={() => { events.refetch(); roster.refetch(); }}
      isEmpty={groupEvents.length === 0 || !roster.data?.length}
      empty={
        <Card>
          <EmptyState
            icon={<UsersIcon className="h-8 w-8" />}
            title={groupEvents.length === 0 ? t("no_events_created", "No group events yet") : t("no_students_active", "No active members")}
            description={groupEvents.length === 0 ? t("create_event_first", "Create an event for your group first.") : ""}
          />
        </Card>
      }
    >
      <Card className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="flex-1">
            <SelectField label={t("select_event", "Event")} value={eventId ?? ""} onChange={(e) => setEventId(Number(e.target.value))}>
              {groupEvents.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.title} — {formatEventDate(e.start_date)}
                </option>
              ))}
            </SelectField>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setAll("PRESENT")}>
              {t("mark_all_present", "All present")}
            </Button>
            <Button variant="outline" onClick={() => setAll("ABSENT")}>
              {t("mark_all_absent", "All absent")}
            </Button>
          </div>
        </div>

        {existing.isLoading ? (
          <div className="skeleton h-40" />
        ) : (
          <ul className="divide-y divide-border">
            {roster.data?.map((s) => {
              const mark = marks[s.id] ?? { status: "PRESENT", remark: "" };
              return (
                <li key={s.id} className="flex flex-col gap-2 py-3 md:flex-row md:items-center">
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-foreground">{s.name}</p>
                    <p className="truncate text-xs text-muted-foreground">{s.email}</p>
                  </div>
                  <div className="flex flex-wrap gap-1" role="radiogroup" aria-label={s.name}>
                    {STATUSES.map((st) => (
                      <button
                        key={st}
                        type="button"
                        role="radio"
                        aria-checked={mark.status === st}
                        onClick={() => setMarks((m) => ({ ...m, [s.id]: { ...mark, status: st } }))}
                        className={`rounded-lg border px-2.5 py-1 text-xs font-semibold ${
                          mark.status === st ? "border-primary bg-primary text-white" : "border-border bg-card text-foreground hover:bg-muted"
                        }`}
                      >
                        {t(st.toLowerCase(), st)}
                      </button>
                    ))}
                  </div>
                  <input
                    aria-label={`${t("remark", "Remark")} — ${s.name}`}
                    className="input md:w-48"
                    placeholder={t("remark", "Remark")}
                    value={mark.remark}
                    onChange={(e) => setMarks((m) => ({ ...m, [s.id]: { ...mark, remark: e.target.value } }))}
                  />
                </li>
              );
            })}
          </ul>
        )}

        <div className="flex justify-end">
          <Button onClick={save} loading={saving} disabled={existing.isLoading}>
            {t("save_attendance", "Save attendance")}
          </Button>
        </div>
      </Card>
    </QueryState>
  );
}
