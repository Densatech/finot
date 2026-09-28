import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthContext";
import {
  courseApi,
  donationApi,
  materialApi,
  notificationApi,
  qaApi,
  serviceApi,
} from "@/lib/api";
import { qk } from "@/lib/queryClient";
import type { MaterialType } from "@/types";

/** Queries that need a signed-in user are disabled until one exists. */
function useSignedIn() {
  return !!useAuth().user;
}

// ---------- Service ----------
export const useSelectionWindow = () =>
  useQuery({ queryKey: qk.selectionWindow, queryFn: serviceApi.selectionWindow, enabled: useSignedIn() });

export const useServiceGroups = () =>
  useQuery({ queryKey: qk.groups, queryFn: serviceApi.groups, enabled: useSignedIn(), staleTime: 5 * 60_000 });

export const useServiceGroup = (id: string | undefined) =>
  useQuery({ queryKey: qk.group(id ?? ""), queryFn: () => serviceApi.group(id!), enabled: useSignedIn() && !!id });

export const useManagedGroup = () =>
  useQuery({ queryKey: qk.managedGroup, queryFn: serviceApi.myManagedGroup, enabled: useSignedIn() });

export const useMySelections = () =>
  useQuery({ queryKey: qk.mySelections, queryFn: serviceApi.mySelections, enabled: useSignedIn() });

export const useMyFamily = () =>
  useQuery({ queryKey: qk.myFamily, queryFn: serviceApi.myFamily, enabled: useSignedIn() });

export const useEvents = () =>
  useQuery({ queryKey: qk.events, queryFn: serviceApi.events, enabled: useSignedIn() });

export const useMyAttendance = () =>
  useQuery({ queryKey: qk.myAttendance, queryFn: serviceApi.myAttendance, enabled: useSignedIn() });

export const useGroupRoster = (enabled = true) =>
  useQuery({ queryKey: qk.groupRoster, queryFn: serviceApi.groupRoster, enabled: useSignedIn() && enabled });

// ---------- Donations ----------
export const useMyDonations = () =>
  useQuery({ queryKey: qk.donations, queryFn: donationApi.myHistory, enabled: useSignedIn() });

// ---------- Q&A ----------
export const useQuestions = (page: number, search: string, category: string) =>
  useQuery({
    queryKey: qk.questions(page, search, category),
    queryFn: () => qaApi.questions({ page, search, category }),
    placeholderData: (previous) => previous,
  });

export const useMyContributions = (enabled = true) =>
  useQuery({ queryKey: qk.myContributions, queryFn: qaApi.myContributions, enabled: useSignedIn() && enabled });

export const usePrivateInbox = (enabled = true) =>
  useQuery({ queryKey: qk.privateInbox, queryFn: qaApi.privateInbox, enabled: useSignedIn() && enabled });

// ---------- Notifications ----------
export const useUnreadCount = () =>
  useQuery({
    queryKey: qk.unreadCount,
    queryFn: notificationApi.unreadCount,
    enabled: useSignedIn(),
    refetchInterval: 60_000,
    refetchIntervalInBackground: false,
  });

export const useNotifications = (page: number) =>
  useQuery({
    queryKey: qk.notifications(page),
    queryFn: () => notificationApi.list(page),
    enabled: useSignedIn(),
    placeholderData: (previous) => previous,
  });

// ---------- Courses ----------
export const useSemesterCourses = (batch?: number) =>
  useQuery({ queryKey: qk.semesterCourses(batch), queryFn: () => courseApi.semesterCourses(batch), enabled: useSignedIn() });

export const useSemesterCourse = (id: string | undefined) =>
  useQuery({ queryKey: qk.semesterCourse(id ?? ""), queryFn: () => courseApi.semesterCourse(id!), enabled: useSignedIn() && !!id });

export const useCourseSessions = (semesterCourseId: string | undefined) =>
  useQuery({
    queryKey: qk.sessions(semesterCourseId ?? ""),
    queryFn: () => courseApi.sessions(semesterCourseId!),
    enabled: useSignedIn() && !!semesterCourseId,
  });

export const useMyCourseAttendance = () =>
  useQuery({ queryKey: qk.myCourseAttendance, queryFn: courseApi.myAttendance, enabled: useSignedIn() });

// ---------- Materials ----------
export const useMaterials = (params: { type?: MaterialType; course?: string; service_group?: number } = {}) =>
  useQuery({ queryKey: qk.materials(params), queryFn: () => materialApi.list(params), enabled: useSignedIn() });
