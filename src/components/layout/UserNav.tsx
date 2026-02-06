import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Settings, LogOut, CreditCard, ChevronDown } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export default function UserNav() {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'psychologist': return 'bg-blue-100 text-blue-700';
      case 'admin': return 'bg-red-100 text-red-700';
      default: return 'bg-green-100 text-green-700';
    }
  };

  const getInitials = () => {
    if (!profile?.displayName) return 'U';
    return profile.displayName
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (!profile) return null;

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 p-1.5 rounded-full hover:bg-gray-100 transition-colors border border-transparent hover:border-gray-200"
      >
        <div className="flex flex-col items-end hidden sm:block mr-1">
          <span className="text-sm font-semibold text-text leading-none">
            {profile.displayName || 'User'}
          </span>
          <span className="text-xs text-text-muted capitalize">
            {profile.role}
          </span>
        </div>
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold border border-primary/20">
          {getInitials()}
        </div>
        <ChevronDown className={`w-4 h-4 text-text-muted transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50 animate-in fade-in zoom-in-95 duration-200">
          <div className="px-4 py-3 border-b border-gray-100 mb-2">
            <p className="font-semibold text-text truncate">{profile.displayName}</p>
            <p className="text-xs text-text-muted truncate">{profile.email}</p>
            <div className={`mt-2 inline-block px-2 py-0.5 rounded text-xs font-medium capitalize ${getRoleBadgeColor(profile.role)}`}>
              {profile.role} Account
            </div>
          </div>

          <div className="px-2 space-y-1">
            <Link
              to={`/${profile.role === 'psychologist' ? 'psychologist/profile' : 'student/settings'}`}
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-3 py-2 text-sm text-text-muted hover:text-primary hover:bg-gray-50 rounded-lg transition-colors"
            >
              <User className="w-4 h-4" />
              My Profile
            </Link>
            
            <Link
              to={`/${profile.role === 'psychologist' ? 'psychologist' : profile.role === 'admin' ? 'admin' : 'student'}/settings`}
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-3 py-2 text-sm text-text-muted hover:text-primary hover:bg-gray-50 rounded-lg transition-colors"
            >
              <Settings className="w-4 h-4" />
              Settings
            </Link>

            {profile.role === 'psychologist' && (
              <Link
                to="/psychologist/earnings"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 px-3 py-2 text-sm text-text-muted hover:text-primary hover:bg-gray-50 rounded-lg transition-colors"
              >
                <CreditCard className="w-4 h-4" />
                Billing & Earnings
              </Link>
            )}
          </div>

          <div className="mt-2 pt-2 border-t border-gray-100 px-2">
            <button
              onClick={handleSignOut}
              className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
