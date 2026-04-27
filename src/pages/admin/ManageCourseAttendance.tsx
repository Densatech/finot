import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { FiCheckCircle, FiClock, FiSave, FiPlus } from "react-icons/fi";
import toast from "react-hot-toast";
import { Card, SectionHeader } from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import EmptyState from "../../components/ui/EmptyState";
import { SkeletonCard } from "../../components/ui/SkeletonLoader";
import { api } from "../../lib/api";

const ManageCourseAttendance = () => {
  const { t } = useTranslation();
  const [courses, setCourses] = useState<any[]>([]);
  const [coursesLoading, setCoursesLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState<number | "">("");
  const [sessionDate, setSessionDate] = useState("");
  const [roster, setRoster] = useState<any[]>([]);
  const [attendanceStatus, setAttendanceStatus] = useState<
    Record<number, string>
  >({});
  const [loadingRoster, setLoadingRoster] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showCreateCourse, setShowCreateCourse] = useState(false);
  const [currentSessionId, setCurrentSessionId] = useState<number | null>(null); // <-- store session ID here

  const [newCourse, setNewCourse] = useState({
    name: "",
    batch_year: 1,
    day1: "MON",
    day2: "",
    start_time: "08:00",
    end_time: "09:30",
    venue: "",
    semester: 1,
    description: "",
  });

  useEffect(() => {
    const loadCourses = async () => {
      try {
        const data = await api.getCourses();
        setCourses(data);
      } catch (e) {
        console.error("Failed to fetch courses", e);
      } finally {
        setCoursesLoading(false);
      }
    };
    loadCourses();
  }, []);

  const handleSelectCourse = (courseId: string) => {
    setSelectedCourse(courseId ? Number(courseId) : "");
    setRoster([]);
    setAttendanceStatus({});
    setCurrentSessionId(null);
  };

  const handleLoadRoster = async () => {
    if (!selectedCourse) {
      toast.error("Select a course");
      return;
    }
    if (!sessionDate) {
      toast.error("Pick a date");
      return;
    }

    setLoadingRoster(true);
    try {
      const sessions = await api.getSessions(Number(selectedCourse));
      let session = sessions.find((s: any) => s.session_date === sessionDate);
      if (!session) {
        session = await api.createSession({
          course: Number(selectedCourse),
          session_date: sessionDate,
        });
        toast.success("New session created");
      }

      // Save session ID in state
      setCurrentSessionId(session.id);

      const rosterData = await api.getSessionRoster(session.id);
      setRoster(rosterData);
      const initial: Record<number, string> = {};
      rosterData.forEach((s: any) => (initial[s.id] = "PRESENT"));
      setAttendanceStatus(initial);
    } catch (error) {
      toast.error("Failed to load roster");
    } finally {
      setLoadingRoster(false);
    }
  };

  const handleStatusChange = (studentId: number, status: string) => {
    setAttendanceStatus((prev) => ({ ...prev, [studentId]: status }));
  };

  const handleMarkAll = (status: string) => {
    const newStatus: Record<number, string> = {};
    roster.forEach((s) => (newStatus[s.id] = status));
    setAttendanceStatus(newStatus);
  };

  const handleSubmit = async () => {
    if (!currentSessionId) {
      toast.error("No session loaded");
      return;
    }
        const attendances: Array<{ student_id: number; status: "PRESENT" | "ABSENT" }> = Object.entries(attendanceStatus).map(
      ([id, status]) => ({
        student_id: Number(id),
        status: status as "PRESENT" | "ABSENT",
      }),
    );
    setSubmitting(true);
    try {
      // The backend expects { attendances: [...] }
      await api.markSessionAttendance(currentSessionId, attendances);
      toast.success(t("attendance_saved"));
    } catch (error) {
      toast.error(t("attendance_save_failed"));
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createCourse(newCourse);
      toast.success("Course created");
      setShowCreateCourse(false);
      const data = await api.getCourses();
      setCourses(data);
    } catch (error) {
      toast.error("Failed to create course");
    }
  };

  return (
    <div className="space-y-6 p-6">
      <SectionHeader
        title={t("manage_course_attendance")}
        description={t("manage_course_attendance_desc")}
        icon={<FiCheckCircle className="h-6 w-6" />}
      />

      <button
        onClick={() => setShowCreateCourse(!showCreateCourse)}
        className="btn-outline flex items-center gap-2"
      >
        <FiPlus /> Create New Course
      </button>

      {showCreateCourse && (
        <Card>
          <form onSubmit={handleCreateCourse} className="space-y-4">
            <div>
              <label>Course Name</label>
              <input
                className="input"
                value={newCourse.name}
                onChange={(e) =>
                  setNewCourse({ ...newCourse, name: e.target.value })
                }
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label>Batch Year</label>
                <select
                  className="input"
                  value={newCourse.batch_year}
                  onChange={(e) =>
                    setNewCourse({
                      ...newCourse,
                      batch_year: Number(e.target.value),
                    })
                  }
                >
                  <option value={1}>1st Year</option>
                  <option value={2}>2nd Year</option>
                  <option value={3}>3rd Year</option>
                  <option value={4}>4th Year</option>
                  <option value={5}>5th Year</option>
                </select>
              </div>
              <div>
                <label>Semester</label>
                <select
                  className="input"
                  value={newCourse.semester}
                  onChange={(e) =>
                    setNewCourse({
                      ...newCourse,
                      semester: Number(e.target.value),
                    })
                  }
                >
                  <option value={1}>Semester 1</option>
                  <option value={2}>Semester 2</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label>Day 1</label>
                <select
                  className="input"
                  value={newCourse.day1}
                  onChange={(e) =>
                    setNewCourse({ ...newCourse, day1: e.target.value })
                  }
                >
                  {["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"].map(
                    (d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ),
                  )}
                </select>
              </div>
              <div>
                <label>Day 2 (optional)</label>
                <select
                  className="input"
                  value={newCourse.day2}
                  onChange={(e) =>
                    setNewCourse({ ...newCourse, day2: e.target.value })
                  }
                >
                  <option value="">None</option>
                  {["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"].map(
                    (d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ),
                  )}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label>Start Time</label>
                <input
                  type="time"
                  className="input"
                  value={newCourse.start_time}
                  onChange={(e) =>
                    setNewCourse({ ...newCourse, start_time: e.target.value })
                  }
                />
              </div>
              <div>
                <label>End Time</label>
                <input
                  type="time"
                  className="input"
                  value={newCourse.end_time}
                  onChange={(e) =>
                    setNewCourse({ ...newCourse, end_time: e.target.value })
                  }
                />
              </div>
            </div>
            <div>
              <label>Venue</label>
              <input
                className="input"
                value={newCourse.venue}
                onChange={(e) =>
                  setNewCourse({ ...newCourse, venue: e.target.value })
                }
              />
            </div>
            <div>
              <label>Description</label>
              <textarea
                className="input"
                value={newCourse.description}
                onChange={(e) =>
                  setNewCourse({ ...newCourse, description: e.target.value })
                }
              />
            </div>
            <button type="submit" className="btn-primary w-full">
              Save Course
            </button>
          </form>
        </Card>
      )}

      {/* Mark Attendance Section */}
      <Card>
        <h3 className="text-lg font-semibold mb-4">Mark Attendance</h3>
        <div className="flex flex-col sm:flex-row gap-4 items-end mb-4">
          <div className="flex-1">
            <label>Course</label>
            {coursesLoading ? (
              <SkeletonCard />
            ) : (
              <select
                className="input"
                value={selectedCourse}
                onChange={(e) => handleSelectCourse(e.target.value)}
              >
                <option value="">Select course</option>
                {courses.map((c: any) => (
                  <option key={c.id} value={c.id}>
                    {c.name} (Year {c.batch_year})
                  </option>
                ))}
              </select>
            )}
          </div>
          <div className="flex-1">
            <label>Date</label>
            <input
              type="date"
              className="input"
              value={sessionDate}
              onChange={(e) => setSessionDate(e.target.value)}
            />
          </div>
          <button onClick={handleLoadRoster} className="btn-primary">
            Load Roster
          </button>
        </div>

        {loadingRoster ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : roster.length === 0 ? (
          <EmptyState
            icon={<FiClock />}
            title="No roster loaded"
            description="Select a course and date, then click Load Roster."
          />
        ) : (
          <>
            <div className="flex justify-between mb-4">
              <h4 className="font-medium">{roster.length} students</h4>
              <div className="flex gap-2">
                <button
                  onClick={() => handleMarkAll("PRESENT")}
                  className="text-xs px-3 py-1 bg-success/10 text-success rounded-lg"
                >
                  Mark All Present
                </button>
                <button
                  onClick={() => handleMarkAll("ABSENT")}
                  className="text-xs px-3 py-1 bg-destructive/10 text-destructive rounded-lg"
                >
                  Mark All Absent
                </button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-border">
                <thead>
                  <tr>
                    <th className="px-4 py-3 text-left">Name</th>
                    <th className="px-4 py-3 text-left">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {roster.map((s: any) => (
                    <tr key={s.id}>
                      <td className="px-4 py-3">{s.name}</td>
                      <td className="px-4 py-3">
                        <div className="flex gap-4">
                          {["PRESENT", "ABSENT"].map((status) => (
                            <label
                              key={status}
                              className="flex items-center gap-2"
                            >
                              <input
                                type="radio"
                                name={`status-${s.id}`}
                                value={status}
                                checked={attendanceStatus[s.id] === status}
                                onChange={() =>
                                  handleStatusChange(s.id, status)
                                }
                              />
                              <span className="text-sm">
                                {t(`status_${status.toLowerCase()}`)}
                              </span>
                            </label>
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-6 flex justify-end">
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="btn-primary flex items-center gap-2"
              >
                <FiSave />
                {submitting ? "Saving..." : "Save Attendance"}
              </button>
            </div>
          </>
        )}
      </Card>
    </div>
  );
};

export default ManageCourseAttendance;
