import { QueryClient } from "@tanstack/react-query";
import { isAxiosError } from "axios";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      gcTime: 10 * 60_000,
      refetchOnWindowFocus: false,
      // Don't hammer the API on client errors (400-499); retry once on network/5xx.
      retry: (failureCount, error) => {
        const status = isAxiosError(error) ? error.response?.status : undefined;
        if (status && status >= 400 && status < 500) return false;
        return failureCount < 1;
      },
    },
    mutations: { retry: false },
  },
});

/** Central query keys so invalidation stays consistent. */
export const qk = {
  me: ["me"] as const,
  profile: ["profile"] as const,
  selectionWindow: ["service", "selection-window"] as const,
  groups: ["service", "groups"] as const,
  group: (id: number | string) => ["service", "groups", String(id)] as const,
  managedGroup: ["service", "managed-group"] as const,
  mySelections: ["service", "my-selections"] as const,
  myFamily: ["service", "my-family"] as const,
  familyMembers: (id: number) => ["service", "family-members", id] as const,
  events: ["service", "events"] as const,
  myAttendance: ["service", "my-attendance"] as const,
  groupRoster: ["service", "group-roster"] as const,
  donations: ["donations", "mine"] as const,
  questions: (page: number, search: string, category: string) => ["qa", "questions", page, search, category] as const,
  myContributions: ["qa", "my-contributions"] as const,
  privateInbox: ["qa", "private-inbox"] as const,
  counselorQueue: ["qa", "counselor-queue"] as const,
  questionModeration: ["qa", "moderation", "questions"] as const,
  answerModeration: ["qa", "moderation", "answers"] as const,
  notifications: (page: number) => ["notifications", "list", page] as const,
  unreadCount: ["notifications", "unread"] as const,
  semesterCourses: (batch?: number) => ["course", "semester-courses", batch ?? "all"] as const,
  semesterCourse: (id: string) => ["course", "semester-course", id] as const,
  sessions: (id: string) => ["course", "sessions", id] as const,
  roster: (sessionId: string) => ["course", "roster", sessionId] as const,
  myCourseAttendance: ["course", "my-attendance"] as const,
  materials: (params: object) => ["materials", params] as const,
};
