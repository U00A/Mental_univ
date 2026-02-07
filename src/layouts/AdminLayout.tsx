import { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  BarChart2, 
  Users, 
  ShieldAlert, 
  FileText, 
  Settings,
  Menu,
  LogOut,
  User,
  Search,
  Bell,
  UserCheck,
  TrendingUp,
  Calendar,
  MessageSquare,
  ClipboardList
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import UserNav from '@/components/layout/UserNav';

export default function AdminLayout() {
  const { profile, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  const navigation = [
    { name: 'Overview', href: '/admin/dashboard', icon: BarChart2 },
    { name: 'User Management', href: '/admin/users', icon: Users },
    { name: 'Applications', href: '/admin/applications', icon: UserCheck },
    { name: 'Appointments', href: '/admin/appointments', icon: Calendar },
    { name: 'Analytics', href: '/admin/analytics', icon: TrendingUp },
    { name: 'Communities', href: '/admin/communities', icon: MessageSquare },
    { name: 'Crisis Flags', href: '/admin/crisis-alerts', icon: ShieldAlert },
    { name: 'Moderation', href: '/admin/moderation', icon: FileText },
    { name: 'Notifications', href: '/admin/notifications', icon: Bell },
    { name: 'Audit Logs', href: '/admin/audit-logs', icon: ClipboardList },
    { name: 'Settings', href: '/admin/settings', icon: Settings },
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
        fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 text-white transform transition-transform duration-200 ease-in-out lg:translate-x-0 lg:h-screen lg:sticky lg:top-0
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="h-full flex flex-col">
          {/* Logo */}
          <div className="h-16 flex items-center gap-3 px-6 border-b border-slate-800">
             <div className="p-1 bg-red-500 rounded-lg">
                <ShieldAlert className="w-5 h-5 text-white" />
             </div>
            <span className="text-xl font-bold tracking-tight">Admin<span className="text-red-400">Panel</span></span>
          </div>

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
                      ? 'bg-red-600 text-white shadow-lg shadow-red-900/20' 
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
              <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 font-bold border border-slate-700">
                {profile?.displayName?.[0] || <User className="w-5 h-5" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">Administrator</p>
                <p className="text-xs text-slate-500 truncate">{profile?.email}</p>
              </div>
            </div>
            <button 
              onClick={handleSignOut}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-red-400 bg-red-400/10 rounded-xl hover:bg-red-400/20 transition-colors"
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
              {navigation.find(n => location.pathname.startsWith(n.href))?.name || 'Overview'}
            </h1>
            
            {/* Search Bar */}
            <div className="hidden lg:flex items-center relative max-w-sm w-full ml-4">
                <Search className="absolute left-3 w-4 h-4 text-text-muted" />
                <input 
                    type="text" 
                    placeholder="Search users, reports..." 
                    className="w-64 pl-10 pr-4 py-2 bg-gray-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-red-500/20 focus:bg-white transition-all"
                />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex px-3 py-1 bg-green-50 text-green-600 rounded-full text-xs font-bold uppercase tracking-wider border border-green-100">
                System Active
            </div>
            <button className="p-2 text-text-muted hover:text-red-600 relative transition-colors rounded-full hover:bg-gray-100">
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
