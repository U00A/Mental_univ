import { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Activity, 
  Users, 
  MessageSquare, 
  BookOpen, 
  Leaf, 
  ShieldAlert, 
  Menu,
  LogOut, 
  User,
  Trophy,
  Home
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import PanicHelper from '@/components/tools/PanicHelper';
import UserNav from '@/components/layout/UserNav';

export default function StudentLayout() {
  const { profile, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [isPanicOpen, setIsPanicOpen] = useState(false);

  const navigation = [
    { name: 'Dashboard', href: '/student/dashboard', icon: LayoutDashboard },
    { name: 'Wellness', href: '/student/wellness', icon: Activity },
    { name: 'Psychologists', href: '/student/psychologists', icon: Users },
    { name: 'Messages', href: '/student/messages', icon: MessageSquare },
    { name: 'Journal & Goals', href: '/student/journal', icon: BookOpen },
    { name: 'Wellness Challenges', href: '/student/challenges', icon: Trophy },
    { name: 'Community', href: '/student/groups', icon: Leaf },
    { name: 'Resources', href: '/student/resources', icon: BookOpen },
    { name: 'Crisis & Safety', href: '/student/crisis', icon: ShieldAlert },
  ];

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-background flex flex-col lg:flex-row">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-border transform transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:h-screen lg:sticky lg:top-0 shrink-0
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="h-full flex flex-col">
          {/* Logo */}
          <Link to="/" className="h-16 flex items-center gap-3 px-6 border-b border-border hover:bg-gray-50 transition-colors">
            <img src="/images/logo.svg" alt="MindWell" className="h-8 w-8" />
            <span className="text-xl font-bold text-text">MindWell</span>
          </Link>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href || (item.href !== '/' && location.pathname.startsWith(item.href));
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`
                    flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors
                    ${isActive 
                      ? 'bg-primary/10 text-primary' 
                      : 'text-text-muted hover:bg-gray-50 hover:text-text'}
                  `}
                >
                  <item.icon className="w-5 h-5" />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* User Profile Footer */}
          <div className="p-4 border-t border-border">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                {profile?.displayName?.[0] || <User className="w-5 h-5" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-text truncate">{profile?.displayName || 'Student'}</p>
                <Link to="/student/settings" className="text-xs text-text-muted hover:text-primary">
                  View Profile
                </Link>
              </div>
            </div>
            <button 
              onClick={handleSignOut}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Wrapper */}
      <div className="flex-1 flex flex-col min-w-0 bg-gray-50/30">
        
        {/* Minimal Global Header */}
        <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-4 sm:px-6 lg:px-8 sticky top-0 z-20">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 -ml-2 text-gray-400 hover:text-gray-900 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <Menu className="w-6 h-6" />
            </button>
            {/* Breadcrumb / Title - simplified */}
            <h1 className="text-lg font-semibold text-gray-800 hidden sm:block">
               {navigation.find(n => location.pathname === n.href || (n.href !== '/' && location.pathname.startsWith(n.href)))?.name || 'Dashboard'}
            </h1>
          </div>

          <div className="flex items-center gap-3 sm:gap-4">
            <button 
              onClick={() => navigate('/')}
              className="hidden md:flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-500 hover:text-primary hover:bg-primary/5 rounded-lg transition-colors"
            >
              <Home className="w-4 h-4" />
              <span>Home</span>
            </button>
            
            <div className="h-6 w-px bg-gray-200 hidden md:block" />

             <button 
                onClick={() => setIsPanicOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 rounded-full text-sm font-semibold transition-all shadow-sm shadow-red-100 animate-pulse"
              >
                <ShieldAlert className="w-4 h-4" />
                <span className="hidden sm:inline">SOS</span>
              </button>
            
            <UserNav />
          </div>
        </header>

        {/* Scrollable Content Area */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto space-y-8">
            <Outlet />
          </div>
        </main>
      </div>

      <PanicHelper isOpen={isPanicOpen} onClose={() => setIsPanicOpen(false)} />
    </div>
  );
}
