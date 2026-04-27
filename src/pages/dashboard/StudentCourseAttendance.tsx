import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { Card, SectionHeader } from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import EmptyState from "../../components/ui/EmptyState";
import { SkeletonCard } from "../../components/ui/SkeletonLoader";
import { useTranslation } from "react-i18next";
import { FiBook, FiCalendar } from "react-icons/fi";
import { api } from "../../lib/api";

const StudentCourseAttendance = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState<string>("");

  useEffect(() => {
    if (!user) return;
    const fetchData = async () => {
      try {
        const data = await api.getStudentCourseAttendance();
        setRecords(data || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  // Get unique course names for filter
  const courseNames = [...new Set(records.map((r) => r.course_name))];
  const filtered = selectedCourse
    ? records.filter((r) => r.course_name === selectedCourse)
    : records;

  if (loading) return <SkeletonCard />;

  return (
    <div className="space-y-6 p-6">
      <SectionHeader
        title={t("course_attendance")}
        description={t("track_course_attendance")}
        icon={<FiBook className="h-6 w-6" />}
      />

      <Card>
        <label className="block text-sm font-medium mb-2">{t("course")}</label>
        <select
          className="input"
          value={selectedCourse}
          onChange={(e) => setSelectedCourse(e.target.value)}
        >
          <option value="">All</option>
          {courseNames.map((name) => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
        </select>
      </Card>

      <Card>
        <h3 className="mb-4 text-base font-medium">
          {t("my_course_attendance")}
        </h3>
        {filtered.length === 0 ? (
          <EmptyState
            icon={<FiCalendar />}
            title={t("no_attendance_records")}
            description={t("attendance_history_will_appear")}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-border">
              <thead>
                <tr>
                  <th className="px-4 py-3 text-left">{t("course")}</th>
                  <th className="px-4 py-3 text-left">{t("date")}</th>
                  <th className="px-4 py-3 text-left">{t("status")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((r) => (
                  <tr key={r.id}>
                    <td className="px-4 py-3">{r.course_name}</td>
                    <td className="px-4 py-3">{r.session_date}</td>
                    <td className="px-4 py-3">
                      <Badge
                        variant={
                          r.status === "PRESENT" ? "success" : "destructive"
                        }
                      >
                        {t(`status_${r.status.toLowerCase()}`)}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
};

export default StudentCourseAttendance;
