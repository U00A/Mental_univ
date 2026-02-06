import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, Loader2, AlertCircle, ChevronLeft } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import Footer from '@/components/layout/Footer';

export default function Login() {
  const navigate = useNavigate();
  const { signIn, signInWithGoogle, resetPassword } = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'student' | 'psychologist'>('student');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resetSent, setResetSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await signIn(email, password);
      // We let the auth state listener update the profile, then Redirect/PublicRoute handles it,
      // or we can just navigate to a default and let the router fix it.
      // Ideally, we wait for profile to load, but signIn logic doesn't return profile.
      // We'll navigate to student dashboard as default, or root.
      navigate('/student/dashboard'); // Temporary default, PublicRoute will correct this if they revisit login
    } catch (err: unknown) {
      const error = err as Error;
      setError(error.message || 'Failed to sign in');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setLoading(true);
    try {
      await signInWithGoogle(role);
      // Navigation is now handled by the PublicRoute/AuthContext state change, 
      // but explicitly navigating helps specific flows.
      if (role === 'psychologist') {
        navigate('/psychologist/dashboard');
      } else {
        navigate('/student/dashboard');
      }
    } catch (err: unknown) {
      const error = err as Error;
      setError(error.message || 'Failed to sign in with Google');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!email) {
      setError('Please enter your email first to reset password');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await resetPassword(email);
      setResetSent(true);
    } catch (err: unknown) {
      const error = err as Error;
      setError(error.message || 'Failed to send reset email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background relative">
      {/* Back to Home */}
      <Link 
        to="/" 
        className="absolute top-4 left-4 p-2 rounded-full hover:bg-gray-100 text-text-muted hover:text-primary transition-colors"
        aria-label="Back to Home"
      >
        <ChevronLeft className="w-6 h-6" />
      </Link>

      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-text">Welcome Back</h1>
            <p className="text-text-muted mt-1">Sign in to your account</p>
          </div>

          {/* Form */}
          <div className="card">
            {error && (
              <div className="flex items-center gap-2 p-3 mb-4 rounded-lg bg-red-50 text-red-600 text-sm">
                <AlertCircle className="w-4 h-4" />
                {error}
              </div>
            )}

            {resetSent && (
              <div className="flex items-center gap-2 p-3 mb-4 rounded-lg bg-green-50 text-green-600 text-sm">
                <AlertCircle className="w-4 h-4" />
                Password reset email sent! Check your inbox.
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text mb-1">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="input pl-10"
                    required
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-sm font-medium text-text">Password</label>
                  <button
                    type="button"
                    onClick={handleResetPassword}
                    className="text-xs text-primary hover:underline font-medium"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="input pl-10 pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary w-full"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'Sign In'}
              </button>
            </form>

            <div className="mt-6">
              <div className="relative mb-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-text-muted">Or continue with</span>
                </div>
              </div>

              <div className="flex justify-center gap-4 mb-4">
                 <label className="flex items-center gap-2 cursor-pointer">
                   <input 
                     type="radio" 
                     name="role" 
                     checked={role === 'student'} 
                     onChange={() => setRole('student')}
                     className="accent-primary"
                   />
                   <span className="text-sm text-text-muted">I'm a Student</span>
                 </label>
                 <label className="flex items-center gap-2 cursor-pointer">
                   <input 
                     type="radio" 
                     name="role" 
                     checked={role === 'psychologist'} 
                     onChange={() => setRole('psychologist')}
                     className="accent-primary"
                   />
                   <span className="text-sm text-text-muted">I'm a Psychologist</span>
                 </label>
              </div>

              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 px-4 py-2 border border-border rounded-xl hover:bg-gray-50 transition-colors text-text font-medium"
              >
                <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5" />
                Google
              </button>
            </div>

            <div className="mt-6 text-center text-sm">
              <span className="text-text-muted">Don't have an account? </span>
              <Link to="/register" className="text-primary font-medium hover:underline">
                Create one
              </Link>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
