// C:\AGTHUB PROJECT FULL\fnot\finot\src\services\attendanceService.ts
import { api } from "../lib/api";
import axiosInstance from "../lib/axios"; // we need axiosInstance directly for blob download
import type {
  CourseAttendanceRecord,
  Course,
  CoursePermissionRequest,
} from "../types";

// ---------- Student Functions ----------
export const fetchStudentCourseAttendance = (
  studentId: number | "me" = "me",
) => {
  return api.getStudentCourseAttendance(studentId);
};

export const requestCoursePermission = (data: {
  course_id: number;
  date: string;
  reason: string;
}) => {
  return api.requestCoursePermission(data);
};

export const fetchStudentCourses = () => {
  return api.getStudentCourses();
};

// ---------- Admin Functions (for Maria) ----------
export const fetchCourseRoster = (courseId: number) => {
  return api.getCourseRoster(courseId);
};

export const markCourseAttendance = (data: {
  course_id: number;
  date: string;
  attendances: Array<{
    student_id: number;
    status: "PRESENT" | "ABSENT" | "EXCUSED";
  }>;
}) => {
  return api.markCourseAttendance(data);
};

export const fetchPermissionRequests = (courseId?: number) => {
  return api.getCoursePermissionRequests(courseId);
};

export const updatePermissionRequest = (
  requestId: number,
  status: "APPROVED" | "DENIED",
) => {
  return api.updatePermissionRequest(requestId, status);
};

// ---------- Reports (Excel Export) ----------
export const downloadAttendanceReport = async (courseId: number) => {
  const response = await axiosInstance.get(
    `/api/attendance/report/${courseId}/`,
    {
      responseType: "blob",
    },
  );
  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", `attendance_report_course_${courseId}.xlsx`);
  document.body.appendChild(link);
  link.click();
  link.remove();
};
