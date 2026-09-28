import { useEffect, useState, type FormEvent } from "react";
import { Link, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { ArrowLeftIcon, CalendarDaysIcon, PlusIcon } from "@heroicons/react/24/outline";
import { useCourseSessions, useSemesterCourse } from "@/hooks/queries";
import { courseApi } from "@/lib/api";
import { getErrorMessage, getFieldErrors } from "@/lib/errors";
import { qk } from "@/lib/queryClient";
import type { CourseAttendanceStatus } from "@/types";
import { Card, SectionHeader } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import EmptyState from "@/components/ui/EmptyState";
import Modal from "@/components/ui/Modal";
import QueryState from "@/components/ui/QueryState";
import { TextField } from "@/components/ui/Field";

const STATUSES: CourseAttendanceStatus[] = ["PRESENT", "ABSENT", "EXCUSED"];

function today() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export default function TakeAttendance() {
  const { t } = useTranslation();
  const { id } = useParams();
  const queryClient = useQueryClient();
  const course = useSemesterCourse(id);
  const sessions = useCourseSessions(id);
  const sorted = [...(sessions.data ?? [])].sort((a, b) => b.date.localeCompare(a.date));

  const [sessionId, setSessionId] = useState<string | null>(null);
  useEffect(() => {
    if (!sessionId && sorted.length) setSessionId(sorted[0].id);
  }, [sessionId, sorted]);

  const roster = useQuery({
    queryKey: qk.roster(sessionId ?? ""),
    queryFn: () => courseApi.roster(sessionId!),
    enabled: !!sessionId,
  });
  const [marks, setMarks] = useState<Record<number, CourseAttendanceStatus>>({});
  useEffect(() => {
    if (roster.data) setMarks(Object.fromEntries(roster.data.map((r) => [r.student_id, r.status ?? "PRESENT"])));
  }, [roster.data]);
  const [saving, setSaving] = useState(false);

  // New session form
  const [creating, setCreating] = useState(false);
  const [newDate, setNewDate] = useState(today());
  const [topic, setTopic] = useState("");
  const [teacher, setTeacher] = useState("");
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const createSession = async (e: FormEvent) => {
    e.preventDefault();
    if (!id) return;
    setSubmitting(true);
    setFormErrors({});
    try {
      const session = await courseApi.createSession({ semester_course: id, date: newDate, topic: topic.trim() || undefined, teacher_name: teacher.trim() || undefined });
      await queryClient.invalidateQueries({ queryKey: qk.sessions(id) });
      setSessionId(session.id);
      setCreating(false);
      setTopic("");
      setTeacher("");
      toast.success(t("session_created_success", "Session created."));
    } catch (err) {
      const fields = getFieldErrors(err);
      if (Object.keys(fields).length) setFormErrors({ date: fields.non_field_errors ?? fields.date ?? Object.values(fields)[0] });
      else toast.error(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const save = async () => {
    if (!sessionId) return;
    setSaving(true);
    try {
      const result = await courseApi.bulkMark(
        sessionId,
        Object.entries(marks).map(([studentId, status]) => ({ student_id: Number(studentId), status })),
      );
      await queryClient.invalidateQueries({ queryKey: qk.roster(sessionId) });
      toast.success(`${t("attendance_saved_success", "Attendance saved.")} (${result.created + result.updated})`);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const setAll = (status: CourseAttendanceStatus) =>
    setMarks((prev) => Object.fromEntries(Object.keys(prev).map((k) => [k, status])));

  return (
    <div className="space-y-5">
      <Link to="/dashboard/courses" className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline">
        <ArrowLeftIcon className="h-4 w-4" aria-hidden="true" />
        {t("back_to_courses", "Back to courses")}
      </Link>

      <QueryState isLoading={course.isLoading} error={course.error} onRetry={course.refetch}>
        {course.data && (
          <SectionHeader
            eyebrow={`${t("batch", "Batch")} ${course.data.batch_year} · ${course.data.academic_year} · ${t("semester", "Semester")} ${course.data.semester}`}
            title={course.data.course_details.title}
            action={
              <Button onClick={() => setCreating(true)}>
                <PlusIcon className="h-4 w-4" aria-hidden="true" />
                {t("create_session", "New session")}
              </Button>
            }
          />
        )}
      </QueryState>

      <QueryState
        isLoading={sessions.isLoading}
        error={sessions.error}
        onRetry={sessions.refetch}
        isEmpty={sorted.length === 0}
        empty={
          <Card>
            <EmptyState
              icon={<CalendarDaysIcon className="h-8 w-8" />}
              title={t("no_sessions_yet", "No sessions yet")}
              description={t("create_first_session", "Create the first class session to take attendance.")}
            />
          </Card>
        }
      >
        <div className="grid gap-5 lg:grid-cols-3">
          <Card padding="none" className="lg:col-span-1">
            <h2 className="rounded-t-2xl bg-primary px-4 py-3 text-sm font-semibold text-white">{t("course_sessions", "Sessions")}</h2>
            <ul className="max-h-[28rem] overflow-y-auto">
              {sorted.map((s) => (
                <li key={s.id}>
                  <button
                    type="button"
                    onClick={() => setSessionId(s.id)}
                    className={`w-full border-l-4 px-4 py-3 text-left text-sm hover:bg-muted ${s.id === sessionId ? "border-accent bg-primary/5 font-semibold text-primary" : "border-transparent text-foreground"}`}
                  >
                    {new Date(s.date).toLocaleDateString()}
                    <span className="block text-xs font-normal text-muted-foreground">
                      {s.topic || t("no_topic", "No topic")}
                      {s.teacher_name ? ` · ${s.teacher_name}` : ""}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </Card>

          <Card className="space-y-4 lg:col-span-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="section-title">{t("mark_attendance", "Attendance")}</h2>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setAll("PRESENT")}>
                  {t("mark_all_present", "All present")}
                </Button>
                <Button variant="outline" onClick={() => setAll("ABSENT")}>
                  {t("mark_all_absent", "All absent")}
                </Button>
              </div>
            </div>
            <QueryState
              isLoading={roster.isLoading}
              error={roster.error}
              onRetry={roster.refetch}
              isEmpty={!roster.data?.length}
              empty={<p className="py-6 text-center text-sm text-muted-foreground">{t("no_students_enrolled", "No students are enrolled in this course yet.")}</p>}
            >
              <ul className="divide-y divide-border">
                {roster.data?.map((r) => (
                  <li key={r.student_id} className="flex flex-col gap-2 py-2.5 sm:flex-row sm:items-center sm:justify-between">
                    <span className="font-medium text-foreground">
                      {[r.first_name, r.last_name].filter(Boolean).join(" ") || r.username}
                    </span>
                    <div className="flex gap-1" role="radiogroup" aria-label={r.username}>
                      {STATUSES.map((st) => (
                        <button
                          key={st}
                          type="button"
                          role="radio"
                          aria-checked={marks[r.student_id] === st}
                          onClick={() => setMarks((m) => ({ ...m, [r.student_id]: st }))}
                          className={`rounded-lg border px-2.5 py-1 text-xs font-semibold ${
                            marks[r.student_id] === st ? "border-primary bg-primary text-white" : "border-border bg-card text-foreground hover:bg-muted"
                          }`}
                        >
                          {t(st.toLowerCase(), st)}
                        </button>
                      ))}
                    </div>
                  </li>
                ))}
              </ul>
              <div className="flex justify-end">
                <Button onClick={save} loading={saving}>
                  {t("save_attendance", "Save attendance")}
                </Button>
              </div>
            </QueryState>
          </Card>
        </div>
      </QueryState>

      <Modal open={creating} onClose={() => setCreating(false)} title={t("create_new_session", "New session")}>
        <form id="session-form" onSubmit={createSession} className="space-y-4">
          <TextField label={t("session_date", "Date")} type="date" required value={newDate} onChange={(e) => setNewDate(e.target.value)} error={formErrors.date} />
          <TextField label={t("topic_optional", "Topic (optional)")} value={topic} onChange={(e) => setTopic(e.target.value)} />
          <TextField label={t("teacher_name_optional", "Teacher (optional)")} value={teacher} onChange={(e) => setTeacher(e.target.value)} hint={t("teacher_name_help", "Guest teacher for this session.")} />
        </form>
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setCreating(false)}>
            {t("cancel", "Cancel")}
          </Button>
          <Button type="submit" form="session-form" loading={submitting}>
            {submitting ? t("creating", "Creating…") : t("create", "Create")}
          </Button>
        </div>
      </Modal>
    </div>
  );
}
