import { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Calendar, 
  MessageSquare, 
  Brain, 
  CreditCard,
  Menu,
  LogOut,
  User,
  Bell,
  Home
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import UserNav from '@/components/layout/UserNav';

export default function PsychologistLayout() {
  const { profile, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  const navigation = [
    { name: 'Home', href: '/', icon: Home },
    { name: 'Dashboard', href: '/psychologist/dashboard', icon: LayoutDashboard },
    { name: 'My Patients', href: '/psychologist/patients', icon: Users },
    { name: 'Calendar', href: '/psychologist/calendar', icon: Calendar },
    { name: 'Messages', href: '/psychologist/messages', icon: MessageSquare },
    { name: 'Professional Dev', href: '/psychologist/education', icon: Brain },
    { name: 'Earnings', href: '/psychologist/earnings', icon: CreditCard },
  ];

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 text-white transform transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:h-screen lg:sticky lg:top-0
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="h-full flex flex-col">
          {/* Logo */}
          <Link to="/" className="h-16 flex items-center gap-3 px-6 border-b border-slate-800 hover:bg-slate-800/50 transition-colors">
            <img src="/images/logo.svg" alt="MindWell" className="h-8 w-8 brightness-0 invert" />
            <span className="text-xl font-bold">MindWell Pro</span>
          </Link>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
            {navigation.map((item) => {
              const isActive = location.pathname.startsWith(item.href);
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`
                    flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors
                    ${isActive 
                      ? 'bg-primary text-white' 
                      : 'text-slate-400 hover:bg-slate-800 hover:text-white'}
                  `}
                >
                  <item.icon className="w-5 h-5" />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* User Profile Footer */}
          <div className="p-4 border-t border-slate-800">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary-light font-bold border border-slate-700">
                {profile?.displayName?.[0] || <User className="w-5 h-5" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{profile?.role || 'Psychologist'}</p>
                <Link to="/psychologist/profile" className="text-xs text-slate-400 hover:text-white">
                  Edit Profile
                </Link>
              </div>
            </div>
            <button 
              onClick={handleSignOut}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-red-400 bg-red-400/10 rounded-lg hover:bg-red-400/20 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-border sticky top-0 z-30 px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 -ml-2 text-text-muted hover:text-primary rounded-lg"
            >
              <Menu className="w-6 h-6" />
            </button>
            <h1 className="text-lg font-semibold text-text hidden sm:block">
              {navigation.find(n => location.pathname.startsWith(n.href))?.name || 'Portal'}
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <button className="p-2 text-text-muted hover:text-primary relative rounded-full hover:bg-gray-100">
              <Bell className="w-5 h-5" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-white" />
            </button>
            <div className="h-8 w-px bg-gray-200 mx-2" />
            <UserNav />
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto bg-gray-50/50">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
