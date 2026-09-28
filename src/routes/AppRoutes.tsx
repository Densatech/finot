import { lazy, Suspense } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import MainLayout from "@/layouts/MainLayout";
import ProtectedRoute from "@/features/auth/components/ProtectedRoute";
import PageLoader from "@/components/ui/PageLoader";
import ScrollToTop from "@/components/navigation/ScrollToTop";
import { ROLES } from "@/types";

// Every page is code-split: visitors only download what they open.
const HomePage = lazy(() => import("@/pages/home/HomePage"));
const AboutPage = lazy(() => import("@/pages/about/AboutPage"));
const ContactPage = lazy(() => import("@/pages/contact/ContactPage"));
const RegisterPage = lazy(() => import("@/pages/auth/RegisterPage"));
const LoginPage = lazy(() => import("@/pages/auth/LoginPage"));
const ForgotPasswordPage = lazy(() => import("@/pages/auth/ForgotPasswordPage"));
const ResetPasswordConfirmPage = lazy(() => import("@/pages/auth/ResetPasswordConfirmPage"));
const AnonymousIntro = lazy(() => import("@/pages/qa/AnonymousIntro"));
const QuestionList = lazy(() => import("@/pages/qa/QuestionList"));
const AskQuestion = lazy(() => import("@/pages/qa/AskQuestion"));
const DonationOutside = lazy(() => import("@/pages/donation/DonationOutside"));
const DonationSuccess = lazy(() => import("@/pages/donation/DonationSuccess"));
const NotFoundPage = lazy(() => import("@/pages/NotFoundPage"));

const DashboardLayout = lazy(() => import("@/layouts/DashboardLayout"));
const DashboardOverview = lazy(() => import("@/pages/dashboard/DashboardOverview"));
const DashboardProfile = lazy(() => import("@/pages/dashboard/DashboardProfile"));
const EditProfile = lazy(() => import("@/pages/profile/EditProfile"));
const DashboardEvents = lazy(() => import("@/pages/dashboard/DashboardEvents"));
const DashboardAttendance = lazy(() => import("@/pages/dashboard/DashboardAttendance"));
const DashboardFamily = lazy(() => import("@/pages/dashboard/DashboardFamily"));
const DashboardService = lazy(() => import("@/pages/dashboard/DashboardService"));
const ServiceGroupDetail = lazy(() => import("@/pages/service/ServiceGroupDetail"));
const PreferenceForm = lazy(() => import("@/pages/service/PreferenceForm"));
const DashboardDonations = lazy(() => import("@/pages/dashboard/DashboardDonations"));
const DonationInside = lazy(() => import("@/pages/donation/DonationInside"));
const DonationHistory = lazy(() => import("@/pages/donation/DonationHistory"));
const DonationProfile = lazy(() => import("@/pages/donation/DonationProfile"));
const DashboardQuestions = lazy(() => import("@/pages/dashboard/DashboardQuestions"));
const DashboardNotifications = lazy(() => import("@/pages/dashboard/DashboardNotifications"));
const ResourcesList = lazy(() => import("@/pages/resources/ResourcesList"));

const ManageAgeglotDashboard = lazy(() => import("@/pages/admin/ManageAgeglotDashboard"));
const EventManagement = lazy(() => import("@/pages/admin/EventManagement"));
const CounselorQueue = lazy(() => import("@/pages/admin/CounselorQueue"));
const ModeratorQueue = lazy(() => import("@/pages/admin/ModeratorQueue"));
const CoordinatorCourses = lazy(() => import("@/pages/course/CoordinatorCourses"));
const TakeAttendance = lazy(() => import("@/pages/course/TakeAttendance"));
const CourseMaterialsPage = lazy(() => import("@/pages/course/CourseMaterialsPage"));

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Suspense fallback={<PageLoader fullScreen />}>
        <Routes>
          <Route element={<MainLayout />}>
            <Route index element={<HomePage />} />
            <Route path="about" element={<AboutPage />} />
            <Route path="contact" element={<ContactPage />} />
            <Route path="register" element={<RegisterPage />} />
            <Route path="login" element={<LoginPage />} />
            <Route path="forgot-password" element={<ForgotPasswordPage />} />
            <Route path="password-reset/confirm/:uid/:token" element={<ResetPasswordConfirmPage />} />
            <Route path="anonymous" element={<AnonymousIntro />} />
            <Route path="anonymous/questions" element={<QuestionList />} />
            <Route path="anonymous/ask" element={<AskQuestion />} />
            <Route path="donate" element={<DonationOutside />} />
            <Route path="donate/success" element={<DonationSuccess />} />
            {/* Chapa return URL configured on the backend */}
            <Route path="donation/success" element={<DonationSuccess />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>

          <Route element={<ProtectedRoute />}>
            <Route path="dashboard" element={<DashboardLayout />}>
              <Route index element={<DashboardOverview />} />
              <Route path="profile" element={<DashboardProfile />} />
              <Route path="profile/edit" element={<EditProfile />} />
              <Route path="events" element={<DashboardEvents />} />
              <Route path="attendance" element={<DashboardAttendance />} />
              <Route path="family" element={<DashboardFamily />} />
              <Route path="service" element={<DashboardService />} />
              <Route path="service/select" element={<PreferenceForm />} />
              <Route path="service/:id" element={<ServiceGroupDetail />} />
              <Route path="donations" element={<DashboardDonations />} />
              <Route path="donations/give" element={<DonationInside />} />
              <Route path="donations/history" element={<DonationHistory />} />
              <Route path="donations/profile" element={<DonationProfile />} />
              <Route path="questions" element={<DashboardQuestions />} />
              <Route path="questions/ask" element={<AskQuestion />} />
              <Route path="notifications" element={<DashboardNotifications />} />
              <Route path="resources" element={<ResourcesList />} />

              <Route element={<ProtectedRoute roles={[ROLES.SERVICE_ADMIN]} />}>
                <Route path="manage-ageglot" element={<ManageAgeglotDashboard />} />
              </Route>
              <Route element={<ProtectedRoute roles={[ROLES.EVENT_MANAGER]} />}>
                <Route path="event-management" element={<EventManagement />} />
              </Route>
              <Route element={<ProtectedRoute roles={[ROLES.QA_COUNSELOR]} />}>
                <Route path="counselor/queue" element={<CounselorQueue />} />
              </Route>
              <Route element={<ProtectedRoute roles={[ROLES.QA_MODERATOR]} />}>
                <Route path="counselor/approve" element={<ModeratorQueue />} />
              </Route>
              <Route element={<ProtectedRoute roles={[ROLES.COURSE_COORDINATOR]} />}>
                <Route path="courses" element={<CoordinatorCourses />} />
                <Route path="courses/coordinator" element={<Navigate to="/dashboard/courses" replace />} />
                <Route path="take-attendance" element={<Navigate to="/dashboard/courses" replace />} />
                <Route path="courses/:id/attendance" element={<TakeAttendance />} />
                <Route path="courses/:id/materials" element={<CourseMaterialsPage />} />
              </Route>
              <Route path="*" element={<NotFoundPage />} />
            </Route>
          </Route>

        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
