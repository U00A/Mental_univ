import { useState } from 'react';
import { User, Bell, Lock, Moon, Sun, Monitor, ChevronRight, Loader2, Check } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

export default function Settings() {
  const { profile, signOut, updateUserProfile } = useAuth();
  const [theme, setTheme] = useState('light');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  
  const [formData, setFormData] = useState({
    displayName: profile?.displayName || '',
  });

  const [notifications, setNotifications] = useState({
    appointments: true,
    messages: true,
    reminders: false,
  });

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.displayName.trim()) return;
    
    setLoading(true);
    setSuccess(false);
    try {
      await updateUserProfile({
        displayName: formData.displayName,
      });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to update profile:', err);
      alert('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        <h1 className="text-2xl font-bold text-text mb-8">Settings</h1>

        <div className="space-y-6">
          {/* Profile Section */}
          <section className="card">
            <h2 className="text-lg font-semibold text-text mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-primary" />
              Profile
            </h2>
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center text-white text-xl font-bold shrink-0">
                  {profile?.displayName?.charAt(0) || 'U'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="grid gap-1">
                    <label className="text-xs font-bold text-text-muted uppercase tracking-wider">Display Name</label>
                    <input 
                      type="text"
                      value={formData.displayName}
                      onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                      className="bg-transparent border-none focus:ring-0 p-0 font-semibold text-text text-lg w-full"
                      placeholder="Your Name"
                    />
                  </div>
                  <p className="text-sm text-text-muted mt-1">{profile?.email}</p>
                </div>
                <button 
                  type="submit"
                  disabled={loading || formData.displayName === profile?.displayName}
                  className="btn btn-primary btn-sm shrink-0"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : success ? <Check className="w-4 h-4" /> : 'Save'}
                </button>
              </div>
              {success && (
                <p className="text-xs text-green-600 font-medium px-4">Profile updated successfully!</p>
              )}
            </form>
          </section>

          {/* Appearance */}
          <section className="card">
            <h2 className="text-lg font-semibold text-text mb-4 flex items-center gap-2">
              <Moon className="w-5 h-5 text-primary" />
              Appearance
            </h2>
            <div className="grid grid-cols-3 gap-3">
              {[
                { id: 'light', icon: Sun, label: 'Light' },
                { id: 'dark', icon: Moon, label: 'Dark' },
                { id: 'system', icon: Monitor, label: 'Auto' },
              ].map((option) => (
                <button
                  key={option.id}
                  onClick={() => setTheme(option.id)}
                  className={`p-4 rounded-xl border-2 transition-colors ${
                    theme === option.id 
                      ? 'border-primary bg-success/30' 
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <option.icon className="w-6 h-6 mx-auto mb-2 text-text" />
                  <p className="text-sm font-medium text-text">{option.label}</p>
                </button>
              ))}
            </div>
          </section>

          {/* Notifications */}
          <section className="card">
            <h2 className="text-lg font-semibold text-text mb-4 flex items-center gap-2">
              <Bell className="w-5 h-5 text-primary" />
              Notifications
            </h2>
            <div className="space-y-3">
              {Object.entries(notifications).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-text capitalize">{key}</p>
                    <p className="text-sm text-text-muted">Receive {key} notifications</p>
                  </div>
                  <button
                    onClick={() => setNotifications(prev => ({ ...prev, [key]: !value }))}
                    className={`w-12 h-6 rounded-full transition-colors relative ${
                      value ? 'bg-primary' : 'bg-gray-300'
                    }`}
                  >
                    <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                      value ? 'left-7' : 'left-1'
                    }`} />
                  </button>
                </div>
              ))}
            </div>
          </section>

          {/* Security */}
          <section className="card">
            <h2 className="text-lg font-semibold text-text mb-4 flex items-center gap-2">
              <Lock className="w-5 h-5 text-primary" />
              Security
            </h2>
            <div className="space-y-2">
              <button className="w-full flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors">
                <div className="flex items-center gap-3">
                  <span className="font-medium text-text">Change Password</span>
                </div>
                <ChevronRight className="w-5 h-5 text-text-muted" />
              </button>
            </div>
          </section>

          {/* Sign Out */}
          <button 
            onClick={signOut}
            className="w-full btn btn-danger"
          >
            Sign Out
          </button>
        </div>
      </main>

      <Footer />
    </div>
  );
}
