import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
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
import PlaceholderPage from "./pages/PlaceholderPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
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
          <Route path="/contact" element={<PlaceholderPage title="Contact Us" description="Get in touch with the Webtuto team." />} />
          <Route path="/terms" element={<PlaceholderPage title="Terms of Service" description="Our terms and conditions for using Webtuto." />} />
          <Route path="/privacy" element={<PlaceholderPage title="Privacy Policy" description="How we handle and protect your data." />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
