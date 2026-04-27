// src/routes/AppRoutes.tsx
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "../layouts/MainLayout";
import DashboardLayout from "../layouts/DashboardLayout";
import HomePage from "../pages/home/HomePage";
import AboutPage from "../pages/about/AboutPage";
import ContactPage from "../pages/contact/ContactPage";
import RegisterPage from "../pages/auth/RegisterPage";
import LoginPage from "../pages/auth/LoginPage";
import ForgotPasswordPage from "../pages/auth/ForgotPasswordPage";
import ResetPasswordConfirmPage from "../pages/auth/ResetPasswordConfirmPage";
import DashboardOverview from "../pages/dashboard/DashboardOverview";
import DashboardProfile from "../pages/dashboard/DashboardProfile";
import DashboardEvents from "../pages/dashboard/DashboardEvents";
import DashboardAttendance from "../pages/dashboard/DashboardAttendance";
import DashboardFamily from "../pages/dashboard/DashboardFamily";
import DashboardService from "../pages/dashboard/DashboardService";
import DashboardDonations from "../pages/dashboard/DashboardDonations";
import DashboardQuestions from "../pages/dashboard/DashboardQuestions";
import DashboardNotifications from "../pages/dashboard/DashboardNotifications";
import EditProfile from "../pages/profile/EditProfile";
import AnonymousIntro from "../pages/qa/AnonymousIntro";
import QuestionList from "../pages/qa/QuestionList";
import AskQuestion from "../pages/qa/AskQuestion";

import {
  DonationOutside,
  DonationInside,
  DonationHistory,
  DonationProfile,
  DonationSuccess,
} from "../pages/donation";
import ServiceGroupDetail from "../pages/service/ServiceGroupDetail";
import PreferenceForm from "../pages/service/PreferenceForm";
import AdminDashboard from "../pages/admin/AdminDashboard";
import GroupAdminDashboard from "../pages/admin/GroupAdminDashboard";
import ProtectedRoute from "../features/auth/components/ProtectedRoute";

// New imports for course attendance
import ManageCourseAttendance from "../pages/admin/ManageCourseAttendance";
import StudentCourseAttendance from "../pages/dashboard/StudentCourseAttendance";

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          {/* public routes */}
          <Route index element={<HomePage />} />
          <Route path="about" element={<AboutPage />} />
          <Route path="contact" element={<ContactPage />} />
          <Route path="register" element={<RegisterPage />} />
          <Route path="login" element={<LoginPage />} />
          <Route path="forgot-password" element={<ForgotPasswordPage />} />
          <Route
            path="password-reset/confirm/:uid/:token"
            element={<ResetPasswordConfirmPage />}
          />
          <Route path="anonymous" element={<AnonymousIntro />} />
          <Route path="anonymous/questions" element={<QuestionList />} />
          <Route path="anonymous/ask" element={<AskQuestion />} />
          <Route path="donate" element={<DonationOutside />} />
          <Route path="donate/success" element={<DonationSuccess />} />
          <Route path="donation/success" element={<DonationSuccess />} />
          <Route path="/contact" element={<ContactPage/>}/>

          {/* Dashboard routes with persistent layout */}
          <Route
            element={
              <ProtectedRoute
<<<<<<< Updated upstream
                allowedRoles={["student", "service_admin", "super_admin"]}
=======
                allowedRoles={[
                  "student",
                  "service_admin",
                  "attendance_manager",
                  "admin",
                ]}
>>>>>>> Stashed changes
              />
            }
          >
            <Route path="dashboard" element={<DashboardLayout />}>
              <Route index element={<DashboardOverview />} />
              <Route path="profile" element={<DashboardProfile />} />
              <Route path="profile/edit" element={<EditProfile />} />
              <Route path="events" element={<DashboardEvents />} />
              <Route path="attendance" element={<DashboardAttendance />} />
              <Route path="family" element={<DashboardFamily />} />
              <Route path="service" element={<DashboardService />} />
              <Route path="service/:id" element={<ServiceGroupDetail />} />
              <Route path="service/select" element={<PreferenceForm />} />
              <Route path="donations" element={<DashboardDonations />} />
              <Route path="donations/give" element={<DonationInside />} />
              <Route path="donations/history" element={<DonationHistory />} />
              <Route path="donations/profile" element={<DonationProfile />} />
              <Route path="questions" element={<DashboardQuestions />} />
<<<<<<< Updated upstream
=======
              <Route path="questions/ask" element={<AskQuestion />} />
>>>>>>> Stashed changes
              <Route
                path="notifications"
                element={<DashboardNotifications />}
              />
<<<<<<< Updated upstream
            </Route>
          </Route>

          {/* Admin‑only routes */}
          <Route
            element={
              <ProtectedRoute allowedRoles={["service_admin", "super_admin"]} />
            }
          >
            <Route path="group-admin" element={<GroupAdminDashboard />} />
          </Route>
          <Route element={<ProtectedRoute allowedRoles={["super_admin"]} />}>
            <Route path="admin" element={<AdminDashboard />} />
          </Route>
=======

              {/* Student course attendance (accessible to students and admins) */}
              <Route
                path="course-attendance"
                element={<StudentCourseAttendance />}
              />

              {/* Admin‑only routes inside dashboard layout */}

              {/* Service Admin: manage ageglot */}
              <Route
                element={<ProtectedRoute allowedRoles={["service_admin"]} />}
              >
                <Route
                  path="manage-ageglot"
                  element={<ManageAgeglotDashboard />}
                />
              </Route>

              {/* Course Attendance Manager: manage course attendance */}
              <Route element={<ProtectedRoute allowedRoles={["attendance_manager", "service_admin", "admin"]} />}>
  <Route path="manage-course-attendance" element={<ManageCourseAttendance />} />
</Route>
            </Route>
          </Route>
>>>>>>> Stashed changes
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
