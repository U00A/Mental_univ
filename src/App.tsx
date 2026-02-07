import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { ToastProvider } from '@/components/ui/Toast';

// Layouts
import StudentLayout from '@/layouts/StudentLayout';
import PsychologistLayout from '@/layouts/PsychologistLayout';
import AdminLayout from '@/layouts/AdminLayout';
import PublicLayout from '@/layouts/PublicLayout';

// Public Pages
import Home from '@/pages/public/Home';
import About from '@/pages/public/About';
import Services from '@/pages/public/Services';
import PublicResources from '@/pages/public/Resources';
import Contact from '@/pages/public/Contact';
import Login from '@/pages/auth/Login';
import Register from '@/pages/auth/Register';
import PlaceholderPage from '@/components/common/PlaceholderPage';
import NotFound from '@/pages/public/NotFound';

// Student Pages
import Dashboard from '@/pages/student/Dashboard';
import Onboarding from '@/pages/student/Onboarding';
import Psychologists from '@/pages/student/Psychologists';
import PsychologistProfile from '@/pages/student/PsychologistProfile';
import Appointments from '@/pages/student/Appointments';
import Messages from '@/pages/student/Messages';
import Communities from '@/pages/student/Communities';
import GroupForum from '@/pages/student/GroupForum';
import PostDetail from '@/pages/student/PostDetail';
import MoodTracker from '@/pages/student/MoodTracker';
import Resources from '@/pages/student/Resources';
import SafetyPlan from '@/pages/student/SafetyPlan';
import CrisisSupport from '@/pages/student/CrisisSupport';
import WellnessChallenges from '@/pages/student/WellnessChallenges';
import VideoCall from '@/pages/student/VideoCall';
import Settings from '@/pages/student/Settings';
import Insights from '@/pages/student/Insights';
import Journal from '@/pages/student/Journal';
import CopingTools from '@/pages/student/CopingTools';
import MyFavorites from '@/pages/student/MyFavorites';
import TherapyGoals from '@/pages/student/TherapyGoals';
import WellnessCenter from '@/pages/student/WellnessCenter';
import Booking from '@/pages/student/Booking';

// Admin Pages
import AdminDashboard from '@/pages/admin/Dashboard';
import AdminUsers from '@/pages/admin/Users';
import AdminModeration from '@/pages/admin/Moderation';
import AdminSettings from '@/pages/admin/Settings';
import CrisisAlerts from '@/pages/admin/CrisisAlerts';

// Psychologist Pages
import PsychologistDashboard from '@/pages/psychologist/Dashboard';
import PsychologistCalendar from '@/pages/psychologist/Calendar';
import PsychologistPatients from '@/pages/psychologist/Patients';
import PsychologistMessages from '@/pages/psychologist/Messages';
import PsychologistEducation from '@/pages/psychologist/Education';
import PsychologistEarnings from '@/pages/psychologist/Earnings';
import PsychologistSettings from '@/pages/psychologist/Settings';
import PsychologistProfilePreview from '@/pages/psychologist/Profile';

// Shared Components
function ProtectedRoute({ children, allowedRole }: { children: React.ReactNode, allowedRole?: string }) {
  const { user, profile, loading } = useAuth();
  
  if (loading) return <div className="h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>;
  if (!user) return <Navigate to="/login" replace />;
  if (allowedRole && profile?.role !== allowedRole && profile?.role !== 'admin') { // Admins can access everything usually, or handle stricter
      return <Navigate to="/dashboard" replace />;
  }
  return <>{children}</>;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { user, profile } = useAuth();
  
  if (user && profile) {
    if (profile.role === 'psychologist') {
      return <Navigate to="/psychologist/dashboard" replace />;
    }
    if (profile.role === 'admin') {
      return <Navigate to="/admin/dashboard" replace />;
    }
    return <Navigate to="/student/dashboard" replace />;
  }
  
  // If user is logged in but profile not loaded yet, wait (or show loading). 
  // However, AuthContext loading state usually handles this at app level if we wanted.
  // For now, if just 'user' exists but no profile, let them stay or redirect to a default.
  // Better to rely on Profile being loaded.
  
  return <>{children}</>;
}

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route element={<PublicLayout />}>
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<About />} />
              <Route path="/services" element={<Services />} />
              <Route path="/resources" element={<PublicResources />} />
              <Route path="/faq" element={<PlaceholderPage title="FAQ" />} />
              <Route path="/contact" element={<Contact />} />
            </Route>
            
            <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
            <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
            
            {/* Onboarding (Protected but outside layout) */}
            <Route path="/student/onboarding" element={<ProtectedRoute><Onboarding /></ProtectedRoute>} />

            {/* Student Portal */}
            <Route path="/student" element={<ProtectedRoute><StudentLayout /></ProtectedRoute>}>
              <Route index element={<Navigate to="/student/dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              
              {/* Wellness & Tools */}
              <Route path="wellness" element={<WellnessCenter />} />
              <Route path="journal" element={<Journal />} />
              <Route path="mood" element={<MoodTracker />} />
              <Route path="goals" element={<TherapyGoals />} />
              <Route path="garden" element={<PlaceholderPage title="Mindfulness Garden" />} />
              
              {/* Psychologists & Booking */}
              <Route path="psychologists" element={<Psychologists />} />
              <Route path="psychologists/:id" element={<PsychologistProfile />} />
              <Route path="book/:psychologistId" element={<Booking />} />
              <Route path="appointments" element={<Appointments />} />
              <Route path="favorites" element={<MyFavorites />} />
              
              {/* Communication */}
              <Route path="messages" element={<Messages />} />
              <Route path="messages/:id" element={<Messages />} />
              <Route path="session/:appointmentId" element={<VideoCall />} />
              
              {/* Community */}
              <Route path="groups" element={<Communities />} />
              <Route path="groups/:id" element={<GroupForum />} />
              <Route path="post/:id" element={<PostDetail />} />
              <Route path="buddies" element={<PlaceholderPage title="Buddy System" />} />
              
              {/* Resources */}
              <Route path="resources" element={<Resources />} />
              <Route path="insights" element={<Insights />} />
              <Route path="coping" element={<CopingTools />} />
              <Route path="learn" element={<PlaceholderPage title="Mental Health 101" />} />
              <Route path="challenges" element={<WellnessChallenges />} />
              
              {/* Safety */}
              <Route path="safety-plan" element={<SafetyPlan />} />
              <Route path="crisis" element={<CrisisSupport />} />
              
              {/* Settings */}
              <Route path="settings" element={<Settings />} />
              <Route path="billing" element={<PlaceholderPage title="Billing & Payments" />} />
            </Route>

            {/* Psychologist Portal */}
            <Route path="/psychologist" element={<ProtectedRoute allowedRole="psychologist"><PsychologistLayout /></ProtectedRoute>}>
               <Route index element={<Navigate to="/psychologist/dashboard" replace />} />
               <Route path="dashboard" element={<PsychologistDashboard />} />
               <Route path="patients" element={<PsychologistPatients />} />
               <Route path="calendar" element={<PsychologistCalendar />} />
               <Route path="messages" element={<PsychologistMessages />} />
               <Route path="education" element={<PsychologistEducation />} />
               <Route path="earnings" element={<PsychologistEarnings />} />
               <Route path="settings" element={<PsychologistSettings />} />
               <Route path="profile" element={<PsychologistProfilePreview />} />
            </Route>

            {/* Admin Portal */}
            <Route path="/admin" element={<ProtectedRoute allowedRole="admin"><AdminLayout /></ProtectedRoute>}>
              <Route index element={<Navigate to="/admin/dashboard" replace />} />
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="users" element={<AdminUsers />} />
              <Route path="psychologist-applications" element={<PlaceholderPage title="Applications" />} />
              <Route path="moderation" element={<AdminModeration />} />
              <Route path="crisis-alerts" element={<CrisisAlerts />} />
              <Route path="settings" element={<AdminSettings />} />
            </Route>

            {/* Fallback */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </ToastProvider>
    </AuthProvider>
  );
}
