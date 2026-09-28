// Types mirror the Django REST serializers (backend/*/serializers.py).

// ---------- Common ----------
/** DRF PageNumberPagination response envelope */
export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

// ---------- Auth & users ----------
export const ROLES = {
  STUDENT: "Student",
  SERVICE_ADMIN: "ServiceAdmin",
  FAMILY_ADMIN: "FamilyAdmin",
  SUPER_ADMIN: "SuperAdmin",
  QA_COUNSELOR: "QACounselor",
  QA_MODERATOR: "QAModerator",
  COURSE_COORDINATOR: "CourseCoordinator",
  EVENT_MANAGER: "EventManager",
} as const;
export type RoleName = (typeof ROLES)[keyof typeof ROLES];

/** GET /auth/users/me/ */
export interface ApiUser {
  id: number;
  username: string;
  email: string;
  first_name: string;
  middle_name: string;
  last_name: string;
  gender: "M" | "F" | null;
  roles: RoleName[];
}

export type ProfileStatus = "IN_CAMPUS" | "GRADUATED";

/** GET/PATCH /api/student/profiles/me/ */
export interface StudentProfile {
  id: string;
  user: number;
  user_email: string;
  first_name: string;
  middle_name: string;
  last_name: string;
  gender: "M" | "F" | null;
  profile_image: string | null;
  batch_year: number | null;
  department: string | null;
  telegram_username: string | null;
  personal_phone: string | null;
  emergency_name: string | null;
  emergency_phone: string | null;
  emergency_relation: string | null;
  home_address: string | null;
  previous_church: string | null;
  activity_serving: string | null;
  dorm_block: number | null;
  dorm_room: number | null;
  section: number | null;
  confession_father: string | null;
  status: ProfileStatus;
  is_complete: boolean;
  created_at: string;
  updated_at: string;
}

/** GET /api/service/groups/my-membership/ */
export interface Membership {
  service_group_name: string;
  service_group_id: number;
  role: "MEMBER" | "LEADER" | "COORDINATOR" | "ADMIN";
  status: "ACTIVE" | "PROBATION" | "INACTIVE";
}

/** The signed-in user as the app uses it (user + profile + membership). */
export interface AuthUser {
  id: number;
  email: string;
  first_name: string;
  middle_name: string;
  last_name: string;
  full_name: string;
  gender: "M" | "F" | null;
  roles: RoleName[];
  profile: StudentProfile | null;
  membership: Membership | null;
}

// ---------- Service ----------
export interface ServiceGroup {
  id: number;
  name: string;
  description: string | null;
  admin_name: string | null;
}

export interface ServiceSelection {
  id?: number;
  service_group: number;
  service_group_name?: string;
  priority: 1 | 2 | 3;
  skills?: string;
  reason?: string;
}

export interface FamilyContact {
  id: number;
  name: string;
  phone: string | null;
}

export interface FamilyMember {
  id: number;
  name: string;
  email: string;
}

export interface Family {
  id: number;
  name: string;
  father: FamilyContact | null;
  mother: FamilyContact | null;
  religious_father: string | null;
  member_count: number;
  siblings: FamilyMember[];
}

export type EventStatus = "UPCOMING" | "ONGOING" | "COMPLETED";

export interface Event {
  id: number;
  title: string;
  description: string;
  start_date: string;
  end_date: string;
  photo: string | null;
  status: EventStatus;
  created_by_name: string | null;
  created_at: string;
  place_name: string | null;
  place_url: string | null;
  service_group: number | null;
  service_group_name: string | null;
}

export type ServiceAttendanceStatus = "PRESENT" | "ABSENT" | "LATE" | "EXCUSED";

export interface AttendanceRecord {
  id: number;
  event: number;
  event_title: string;
  event_date: string;
  status: ServiceAttendanceStatus;
  remark: string | null;
  recorded_at: string;
}

// ---------- Donations ----------
export const FUND_CATEGORIES = [
  "Weekly Donation",
  "Building Fund",
  "Charity (Poor)",
  "Special Events",
  "Other",
] as const;
export type FundCategory = (typeof FUND_CATEGORIES)[number];

export type PaymentStatus = "PENDING" | "COMPLETED" | "FAILED";

export interface DonationPayment {
  amount: string;
  currency: string;
  status: PaymentStatus;
  transaction_reference: string;
  created_at: string;
}

export interface Donation {
  id: number;
  fund_category: FundCategory;
  donated_at: string;
  payment: DonationPayment;
}

/** GET /api/donations/verify/{tx_ref}/ */
export interface DonationReceipt {
  status: string;
  payment_status: PaymentStatus;
  amount: number | string;
  currency: string;
  tx_ref: string;
  date: string;
  donor_name: string;
}

// ---------- Q&A ----------
export const QA_CATEGORIES = ["Spiritual", "Academic", "Family", "Personal", "Other"] as const;
export type QACategory = (typeof QA_CATEGORIES)[number];

export interface Answer {
  id: number;
  question: string;
  display_name: string;
  answer_body: string;
  created_at: string;
  is_approved: boolean;
  is_mine: boolean;
}

export interface PendingAnswer extends Answer {
  question_body: string;
  question_category: QACategory;
}

export interface Question {
  id: string;
  display_name: string;
  category: QACategory;
  question_body: string;
  visibility: "PUBLIC" | "PRIVATE";
  answer_count: number;
  created_at: string;
  is_approved: boolean;
  answers: Answer[];
  is_mine: boolean;
  /** Only in the counselor queue */
  asker_name?: string | null;
}

// ---------- Notifications ----------
export interface AppNotification {
  id: number;
  title: string;
  message: string;
  notification_type: string;
  is_read: boolean;
  created_at: string;
}

// ---------- Courses ----------
export interface Course {
  id: string;
  title: string;
  description: string | null;
  batch_year: number;
  is_active: boolean;
}

export interface UserSummary {
  id: number;
  username: string;
  email: string;
  first_name: string;
  middle_name: string;
  last_name: string;
}

export interface SemesterCourse {
  id: string;
  course: string;
  course_details: Course;
  batch_year: number;
  academic_year: number;
  semester: 1 | 2;
  coordinators: number[];
  coordinators_details: UserSummary[];
  created_at: string;
}

export interface CourseSession {
  id: string;
  semester_course: string;
  date: string;
  topic: string | null;
  teacher_name: string | null;
  created_at: string;
}

export type CourseAttendanceStatus = "PRESENT" | "ABSENT" | "EXCUSED";

export interface CourseAttendanceRecord {
  id: string;
  session: string;
  session_date: string;
  session_topic: string | null;
  semester_course: string;
  course_title: string;
  student: number;
  status: CourseAttendanceStatus;
  updated_at: string;
}

export interface RosterEntry {
  student_id: number;
  first_name: string;
  last_name: string;
  username: string;
  status: CourseAttendanceStatus | null;
}

// ---------- Materials ----------
export type MaterialType = "COURSE" | "SERVICE" | "GENERAL";

export interface Material {
  id: string;
  title: string;
  description: string | null;
  file: string | null;
  url: string | null;
  material_type: MaterialType;
  course: string | null;
  course_title: string | null;
  service_group: number | null;
  service_group_name: string | null;
  uploaded_by: number | null;
  uploaded_by_details: UserSummary | null;
  created_at: string;
  updated_at: string;
}
