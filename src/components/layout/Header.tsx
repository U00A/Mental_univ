import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Bell, User, LogOut, ChevronLeft, Menu, X, Wind } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import PanicHelper from '@/components/tools/PanicHelper';

export default function Header() {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isPanicOpen, setIsPanicOpen] = useState(false);

  // Routes where the back button should NOT appear
  const mainRoutes = ['/dashboard', '/', '/login', '/register'];
  const showBackButton = !mainRoutes.includes(location.pathname);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
    setIsMenuOpen(false);
  };

  const navLinks = [
    { name: 'Dashboard', path: '/dashboard' },
    { name: 'Psychologists', path: '/psychologists' },
    { name: 'Appointments', path: '/appointments' },
    { name: 'Community', path: '/community' },
    { name: 'Insights', path: '/insights' },
    { name: 'Messages', path: '/messages' },
    { name: 'Resources', path: '/resources' },
  ];

  return (
    <header className="sticky top-0 z-50 glass border-b border-white/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left Section: Back Button & Logo */}
          <div className="flex items-center gap-4">
            {showBackButton && (
              <button 
                onClick={() => navigate(-1)}
                className="p-2 rounded-full hover:bg-gray-100 text-text-muted hover:text-primary transition-colors"
                aria-label="Go back"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
            )}
            
            <Link to="/" className="flex items-center gap-2">
              <img src="/images/mindspace_logo_1770492717933.svg" alt="Rahatek" className="h-10 w-10" />
              <span className="text-xl font-semibold hidden sm:block" style={{ color: '#2D6A4F' }}>Rahatek</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link 
                key={link.path}
                to={link.path} 
                className={`text-sm font-medium transition-colors ${
                  location.pathname === link.path 
                    ? 'text-primary font-semibold' 
                    : 'text-text-muted hover:text-primary'
                }`}
              >
                {link.name}
              </Link>
            ))}
          </nav>

          {/* User Actions & Mobile Toggle */}
          <div className="flex items-center gap-3">
             {/* Mobile Menu Button */}
             <button 
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 text-text-muted"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

            <div className="hidden md:flex items-center gap-3">
              <button 
                onClick={() => setIsPanicOpen(true)}
                className="btn btn-primary btn-sm rounded-xl px-4 flex items-center gap-2 group overflow-hidden relative"
              >
                <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500" />
                <Wind className="w-4 h-4 animate-float" />
                <span>Breathe</span>
              </button>

              <button className="p-2.5 rounded-xl hover:bg-gray-100/50 text-text-muted relative transition-colors">
                <Bell className="w-5 h-5" />
                <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
              </button>
              
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white text-sm font-medium">
                  {profile?.displayName?.charAt(0) || <User className="w-4 h-4" />}
                </div>
                <span className="text-sm font-medium text-text">
                  {profile?.displayName || 'User'}
                </span>
              </div>

              <button 
                onClick={handleSignOut}
                className="p-2 rounded-lg hover:bg-red-50 text-text-muted hover:text-red-600 transition-colors"
                title="Sign out"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMenuOpen && (
        <div className="md:hidden border-t border-border bg-white absolute w-full shadow-lg">
          <div className="px-4 py-2 space-y-1">
            {navLinks.map((link) => (
              <Link 
                key={link.path}
                to={link.path}
                onClick={() => setIsMenuOpen(false)}
                className={`block px-3 py-3 rounded-lg text-base font-medium ${
                  location.pathname === link.path 
                    ? 'bg-primary/10 text-primary' 
                    : 'text-text-muted hover:bg-gray-50'
                }`}
              >
                {link.name}
              </Link>
            ))}
            <div className="border-t border-border my-2 pt-2">
              <div className="flex items-center gap-3 px-3 py-2">
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white text-sm font-medium">
                  {profile?.displayName?.charAt(0) || 'U'}
                </div>
                <p className="text-sm font-medium text-text">{profile?.displayName || 'User'}</p>
              </div>
              <button 
                onClick={handleSignOut}
                className="w-full flex items-center gap-2 px-3 py-3 text-red-600 hover:bg-red-50 rounded-lg text-sm font-medium mt-1"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Panic Helper Modal */}
      <PanicHelper isOpen={isPanicOpen} onClose={() => setIsPanicOpen(false)} />
    </header>
  );
}
