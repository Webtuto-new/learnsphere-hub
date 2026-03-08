import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import CurriculumPage from "./pages/CurriculumPage";
import ClassesPage from "./pages/ClassesPage";
import ClassDetailPage from "./pages/ClassDetailPage";
import RecordingsPage from "./pages/RecordingsPage";
import BundlesPage from "./pages/BundlesPage";
import SeminarsPage from "./pages/SeminarsPage";
import WorkshopsPage from "./pages/WorkshopsPage";
import HowToUsePage from "./pages/HowToUsePage";
import TutorApplicationPage from "./pages/TutorApplicationPage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import PlaceholderPage from "./pages/PlaceholderPage";
import NotFound from "./pages/NotFound";

// Dashboard pages
import DashboardLayout from "./pages/dashboard/DashboardLayout";
import DashboardOverview from "./pages/dashboard/DashboardOverview";
import DashboardSchedule from "./pages/dashboard/DashboardSchedule";
import DashboardClasses from "./pages/dashboard/DashboardClasses";
import DashboardPayments from "./pages/dashboard/DashboardPayments";
import DashboardProfile from "./pages/dashboard/DashboardProfile";
import DashboardPlaceholder from "./pages/dashboard/DashboardPlaceholder";

// Admin pages
import AdminLayout from "./pages/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminClasses from "./pages/admin/AdminClasses";
import AdminStudents from "./pages/admin/AdminStudents";
import AdminApplications from "./pages/admin/AdminApplications";
import AdminPlaceholder from "./pages/admin/AdminPlaceholder";

const queryClient = new QueryClient();

const DashboardWrapper = ({ children }: { children: React.ReactNode }) => (
  <ProtectedRoute><DashboardLayout>{children}</DashboardLayout></ProtectedRoute>
);

const AdminWrapper = ({ children }: { children: React.ReactNode }) => (
  <ProtectedRoute requireAdmin><AdminLayout>{children}</AdminLayout></ProtectedRoute>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            {/* Public */}
            <Route path="/" element={<Index />} />
            <Route path="/curriculum" element={<CurriculumPage />} />
            <Route path="/classes" element={<ClassesPage />} />
            <Route path="/class/:id" element={<ClassDetailPage />} />
            <Route path="/recordings" element={<RecordingsPage />} />
            <Route path="/bundles" element={<BundlesPage />} />
            <Route path="/seminars" element={<SeminarsPage />} />
            <Route path="/workshops" element={<WorkshopsPage />} />
            <Route path="/how-to-use" element={<HowToUsePage />} />
            <Route path="/tutor-application" element={<TutorApplicationPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            <Route path="/contact" element={<PlaceholderPage title="Contact Us" description="Get in touch with the Webtuto team." />} />
            <Route path="/terms" element={<PlaceholderPage title="Terms of Service" description="Our terms and conditions for using Webtuto." />} />
            <Route path="/privacy" element={<PlaceholderPage title="Privacy Policy" description="How we handle and protect your data." />} />

            {/* Student Dashboard */}
            <Route path="/dashboard" element={<DashboardWrapper><DashboardOverview /></DashboardWrapper>} />
            <Route path="/dashboard/schedule" element={<DashboardWrapper><DashboardSchedule /></DashboardWrapper>} />
            <Route path="/dashboard/classes" element={<DashboardWrapper><DashboardClasses /></DashboardWrapper>} />
            <Route path="/dashboard/recordings" element={<DashboardWrapper><DashboardPlaceholder title="My Recordings" /></DashboardWrapper>} />
            <Route path="/dashboard/notes" element={<DashboardWrapper><DashboardPlaceholder title="My Notes" /></DashboardWrapper>} />
            <Route path="/dashboard/payments" element={<DashboardWrapper><DashboardPayments /></DashboardWrapper>} />
            <Route path="/dashboard/profile" element={<DashboardWrapper><DashboardProfile /></DashboardWrapper>} />
            <Route path="/dashboard/certificates" element={<DashboardWrapper><DashboardPlaceholder title="Certificates" /></DashboardWrapper>} />
            <Route path="/dashboard/referrals" element={<DashboardWrapper><DashboardPlaceholder title="Referrals" /></DashboardWrapper>} />

            {/* Admin Dashboard */}
            <Route path="/admin" element={<AdminWrapper><AdminDashboard /></AdminWrapper>} />
            <Route path="/admin/classes" element={<AdminWrapper><AdminClasses /></AdminWrapper>} />
            <Route path="/admin/students" element={<AdminWrapper><AdminStudents /></AdminWrapper>} />
            <Route path="/admin/teachers" element={<AdminWrapper><AdminPlaceholder title="Manage Teachers" /></AdminWrapper>} />
            <Route path="/admin/applications" element={<AdminWrapper><AdminApplications /></AdminWrapper>} />
            <Route path="/admin/recordings" element={<AdminWrapper><AdminPlaceholder title="Manage Recordings" /></AdminWrapper>} />
            <Route path="/admin/curriculum" element={<AdminWrapper><AdminPlaceholder title="Manage Curriculum" /></AdminWrapper>} />
            <Route path="/admin/payments" element={<AdminWrapper><AdminPlaceholder title="Manage Payments" /></AdminWrapper>} />
            <Route path="/admin/coupons" element={<AdminWrapper><AdminPlaceholder title="Manage Coupons" /></AdminWrapper>} />
            <Route path="/admin/announcements" element={<AdminWrapper><AdminPlaceholder title="Manage Announcements" /></AdminWrapper>} />
            <Route path="/admin/analytics" element={<AdminWrapper><AdminPlaceholder title="Analytics" /></AdminWrapper>} />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
