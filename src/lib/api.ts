import { isAxiosError } from "axios";
import http from "./axios";
import { tokens } from "./tokens";
import type {
  Answer,
  ApiUser,
  AppNotification,
  AttendanceRecord,
  AuthUser,
  CourseAttendanceRecord,
  CourseSession,
  Donation,
  DonationReceipt,
  Event,
  Family,
  FamilyMember,
  FundCategory,
  Material,
  MaterialType,
  Membership,
  PaginatedResponse,
  PendingAnswer,
  Question,
  QACategory,
  RosterEntry,
  SemesterCourse,
  ServiceGroup,
  ServiceAttendanceStatus,
  ServiceSelection,
  StudentProfile,
} from "@/types";

type Params = Record<string, string | number | boolean | undefined | null>;

function cleanParams(params?: Params) {
  if (!params) return undefined;
  return Object.fromEntries(Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== ""));
}

async function getPage<T>(url: string, params?: Params): Promise<PaginatedResponse<T>> {
  const { data } = await http.get<PaginatedResponse<T> | T[]>(url, { params: cleanParams(params) });
  if (Array.isArray(data)) return { count: data.length, next: null, previous: null, results: data };
  return data;
}

/** Follow DRF pagination until every item is loaded (capped as a safety net). */
async function getAll<T>(url: string, params?: Params, maxPages = 25): Promise<T[]> {
  const items: T[] = [];
  for (let page = 1; page <= maxPages; page++) {
    const data = await getPage<T>(url, { ...params, page });
    items.push(...data.results);
    if (!data.next) break;
  }
  return items;
}

async function getOrNull<T>(url: string): Promise<T | null> {
  try {
    const { data } = await http.get<T>(url);
    return data;
  } catch (error) {
    if (isAxiosError(error) && error.response?.status === 404) return null;
    throw error;
  }
}

export function buildAuthUser(user: ApiUser, profile: StudentProfile | null, membership: Membership | null): AuthUser {
  const full_name = [user.first_name, user.middle_name, user.last_name].filter(Boolean).join(" ");
  return {
    id: user.id,
    email: user.email,
    first_name: user.first_name,
    middle_name: user.middle_name,
    last_name: user.last_name,
    full_name: full_name || user.email,
    gender: user.gender,
    roles: user.roles ?? [],
    profile,
    membership,
  };
}

// ---------------- Auth ----------------
export interface RegisterPayload {
  email: string;
  password: string;
  first_name: string;
  middle_name: string;
  last_name: string;
  gender: "M" | "F";
}

export const authApi = {
  async me(): Promise<AuthUser> {
    // Independent requests: run them in parallel.
    const [user, profile, membership] = await Promise.all([
      http.get<ApiUser>("/auth/users/me/").then((r) => r.data),
      getOrNull<StudentProfile>("/api/student/profiles/me/"),
      getOrNull<Membership>("/api/service/groups/my-membership/"),
    ]);
    return buildAuthUser(user, profile, membership);
  },

  async login(email: string, password: string): Promise<void> {
    tokens.clear();
    const { data } = await http.post<{ access: string; refresh: string }>("/auth/jwt/create/", {
      username: email.trim(),
      password,
    });
    tokens.set(data.access, data.refresh);
  },

  async register(payload: RegisterPayload): Promise<void> {
    tokens.clear();
    await http.post("/auth/users/", { ...payload, email: payload.email.trim() });
  },

  async logout(): Promise<void> {
    const refresh = tokens.getRefresh();
    try {
      if (refresh && tokens.getAccess()) await http.post("/auth/jwt/logout/", { refresh });
    } catch {
      // Best effort: the local session is cleared regardless.
    } finally {
      tokens.clear();
    }
  },

  requestPasswordReset: (email: string) => http.post("/auth/users/reset_password/", { email: email.trim() }),

  confirmPasswordReset: (uid: string, token: string, new_password: string) =>
    http.post("/auth/users/reset_password_confirm/", { uid, token, new_password, re_new_password: new_password }),
};

// ---------------- Profile ----------------
export const profileApi = {
  get: () => http.get<StudentProfile>("/api/student/profiles/me/").then((r) => r.data),
  update: (data: FormData | Partial<StudentProfile>) =>
    http.patch<StudentProfile>("/api/student/profiles/me/", data).then((r) => r.data),
};

// ---------------- Service ----------------
export const serviceApi = {
  selectionWindow: () =>
    http.get<{ selection_open: boolean }>("/api/service/configuration/").then((r) => r.data.selection_open),
  groups: () => getAll<ServiceGroup>("/api/service/groups/"),
  group: (id: number | string) => http.get<ServiceGroup>(`/api/service/groups/${id}/`).then((r) => r.data),
  myManagedGroup: () => getOrNull<ServiceGroup>("/api/service/groups/my-group/"),
  mySelections: () => getAll<ServiceSelection>("/api/service/selections/"),
  submitSelections: (selections: ServiceSelection[]) =>
    http.post<ServiceSelection[]>("/api/service/selections/", { selections }).then((r) => r.data),
  myFamily: () => getOrNull<Family>("/api/service/families/my-family/"),
  familyMembers: (id: number) => http.get<FamilyMember[]>(`/api/service/families/${id}/members/`).then((r) => r.data),

  events: () => getAll<Event>("/api/service/events/"),
  createEvent: (data: FormData) => http.post<Event>("/api/service/events/", data).then((r) => r.data),
  updateEvent: (id: number, data: FormData) => http.patch<Event>(`/api/service/events/${id}/`, data).then((r) => r.data),
  deleteEvent: (id: number) => http.delete(`/api/service/events/${id}/`),

  myAttendance: () => getAll<AttendanceRecord>("/api/service/attendance/"),
  groupRoster: () => http.get<FamilyMember[]>("/api/service/attendance/group-members/").then((r) => r.data),
  eventAttendance: (eventId: number) =>
    http
      .get<{ student_id: number; status: ServiceAttendanceStatus; remark: string | null }[]>("/api/service/attendance/event-records/", {
        params: { event: eventId },
      })
      .then((r) => r.data),
  markAttendance: (event_id: number, attendances: { student_id: number; status: string; remark?: string }[]) =>
    http.post("/api/service/attendance/mark/", { event_id, attendances }).then((r) => r.data),
};

// ---------------- Donations ----------------
export interface DonationPayload {
  amount: number;
  fund_category: FundCategory;
  first_name?: string;
  last_name?: string;
  email?: string;
}

export const donationApi = {
  myHistory: () => getAll<Donation>("/api/donations/my-history/"),
  initiate: (payload: DonationPayload) =>
    http.post<{ checkout_url: string; tx_ref: string }>("/api/donations/initiate/", payload).then((r) => r.data),
  /** Resolves for 200 (completed) and 202 (pending); rejects for 400/404/503. */
  verify: (txRef: string) => http.get<DonationReceipt>(`/api/donations/verify/${encodeURIComponent(txRef)}/`),
};

// ---------------- Q&A ----------------
export interface QuestionPayload {
  display_name: string;
  category: QACategory;
  question_body: string;
  visibility: "PUBLIC" | "PRIVATE";
}

export const qaApi = {
  questions: (params: { page?: number; search?: string; category?: string }) =>
    getPage<Question>("/api/qa/questions/", {
      page: params.page,
      search: params.search,
      category: params.category && params.category !== "all" ? params.category : undefined,
    }),
  ask: (payload: QuestionPayload) => http.post<Question>("/api/qa/questions/", payload).then((r) => r.data),
  updateQuestion: (id: string, data: Partial<QuestionPayload>) =>
    http.patch<Question>(`/api/qa/questions/${id}/`, data).then((r) => r.data),
  deleteQuestion: (id: string) => http.delete(`/api/qa/questions/${id}/`),
  answer: (payload: { question: string; display_name: string; answer_body: string }) =>
    http.post<Answer>("/api/qa/answers/", payload).then((r) => r.data),
  deleteAnswer: (id: number) => http.delete(`/api/qa/answers/${id}/`),

  myContributions: () =>
    http.get<{ questions: Question[]; answers: Answer[] }>("/api/qa/questions/my-contributions/").then((r) => r.data),
  privateInbox: () => http.get<Question[]>("/api/qa/questions/private-inbox/").then((r) => r.data),
  counselorQueue: () => http.get<Question[]>("/api/qa/questions/counselor-queue/").then((r) => r.data),
  questionModerationQueue: () => http.get<Question[]>("/api/qa/questions/moderation-queue/").then((r) => r.data),
  answerModerationQueue: () => getAll<PendingAnswer>("/api/qa/answers/moderation-queue/"),
  approveQuestion: (id: string) => http.post(`/api/qa/questions/${id}/approve/`),
  approveAnswer: (id: number) => http.post(`/api/qa/answers/${id}/approve/`),
};

// ---------------- Notifications ----------------
export const notificationApi = {
  list: (page = 1) => getPage<AppNotification>("/api/notifications/", { page }),
  unreadCount: () => http.get<{ unread: number }>("/api/notifications/unread-count/").then((r) => r.data.unread),
  markRead: (id: number) => http.post(`/api/notifications/${id}/mark-read/`),
  markAllRead: () => http.post("/api/notifications/mark-all-read/"),
  registerDevice: (device_token: string) => http.post("/api/notifications/device-token/", { device_token }),
};

// ---------------- Courses ----------------
export const courseApi = {
  semesterCourses: (batchYear?: number) =>
    getAll<SemesterCourse>("/api/course/semester-courses/", { batch_year: batchYear }),
  semesterCourse: (id: string) => http.get<SemesterCourse>(`/api/course/semester-courses/${id}/`).then((r) => r.data),
  sessions: (semesterCourseId: string) => getAll<CourseSession>("/api/course/sessions/", { semester_course: semesterCourseId }),
  createSession: (data: { semester_course: string; date: string; topic?: string; teacher_name?: string }) =>
    http.post<CourseSession>("/api/course/sessions/", data).then((r) => r.data),
  roster: (sessionId: string) =>
    http.get<{ roster: RosterEntry[] }>(`/api/course/sessions/${sessionId}/roster/`).then((r) => r.data.roster),
  bulkMark: (sessionId: string, records: { student_id: number; status: string }[]) =>
    http.post<{ created: number; updated: number }>(`/api/course/attendance/bulk-mark/${sessionId}/`, { records }).then((r) => r.data),
  myAttendance: () => getAll<CourseAttendanceRecord>("/api/course/attendance/"),
};

// ---------------- Materials ----------------
export const materialApi = {
  list: (params?: { type?: MaterialType; course?: string; service_group?: number }) =>
    getAll<Material>("/api/resources/materials/", params),
  create: (data: FormData) => http.post<Material>("/api/resources/materials/", data).then((r) => r.data),
  remove: (id: string) => http.delete(`/api/resources/materials/${id}/`),
};
