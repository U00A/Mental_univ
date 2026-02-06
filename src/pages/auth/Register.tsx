import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Lock, Eye, EyeOff, Loader2, AlertCircle, GraduationCap, Stethoscope, ChevronLeft } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import Footer from '@/components/layout/Footer';

export default function Register() {
  const navigate = useNavigate();
  const { signUp, signInWithGoogle } = useAuth();
  
  const [step, setStep] = useState(1);
  const [role, setRole] = useState<'student' | 'psychologist'>('student');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await signUp(email, password, role, name);
      if (role === 'psychologist') {
        navigate('/psychologist/dashboard');
      } else {
        navigate('/student/dashboard');
      }
    } catch (err: unknown) {
      const error = err as Error;
      setError(error.message || 'Failed to create account');
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
            <h1 className="text-2xl font-bold text-text">
              {step === 1 ? 'Create Account' : 'Enter Details'}
            </h1>
            <p className="text-text-muted mt-1">
              {step === 1 ? 'Choose your account type' : `Signing up as ${role}`}
            </p>
          </div>

          {/* Step 1: Role Selection */}
          {step === 1 && (
            <div className="space-y-4">
              <button
                onClick={() => { setRole('student'); setStep(2); }}
                className="card card-hover w-full flex items-center gap-4 text-left"
              >
                <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
                  <GraduationCap className="w-6 h-6 text-green-700" />
                </div>
                <div>
                  <h3 className="font-semibold text-[#2C3E50]">I'm a Student</h3>
                  <p className="text-sm text-[#7F8C8D]">Access mental health support</p>
                </div>
              </button>

              <button
                onClick={() => { setRole('psychologist'); setStep(2); }}
                className="card card-hover w-full flex items-center gap-4 text-left"
              >
                <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                  <Stethoscope className="w-6 h-6 text-blue-700" />
                </div>
                <div>
                  <h3 className="font-semibold text-[#2C3E50]">I'm a Psychologist</h3>
                  <p className="text-sm text-[#7F8C8D]">Provide consultations</p>
                </div>
              </button>
            </div>
          )}

          {/* Step 2: Details Form */}
          {step === 2 && (
            <div className="card">
              {error && (
                <div className="flex items-center gap-2 p-3 mb-4 rounded-lg bg-red-50 text-red-600 text-sm">
                  <AlertCircle className="w-4 h-4" />
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[#2C3E50] mb-1">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#7F8C8D]" />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Your name"
                      className="input pl-10"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#2C3E50] mb-1">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#7F8C8D]" />
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
                  <label className="block text-sm font-medium text-[#2C3E50] mb-1">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#7F8C8D]" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Min 6 characters"
                      className="input pl-10 pr-10"
                      required
                      minLength={6}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#7F8C8D]"
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
                  {loading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'Create Account'}
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

                <button
                  type="button"
                  onClick={async () => {
                    setError('');
                    setLoading(true);
                    try {
                      await signInWithGoogle(role);
                      navigate('/dashboard');
                    } catch (err: unknown) {
                      const error = err as Error;
                      setError(error.message || 'Failed to sign up with Google');
                    } finally {
                      setLoading(false);
                    }
                  }}
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-3 px-4 py-2 border border-border rounded-xl hover:bg-gray-50 transition-colors text-text font-medium"
                >
                  <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5" />
                  Google
                </button>
              </div>

              <button
                onClick={() => setStep(1)}
                className="w-full mt-4 text-sm text-text-muted hover:text-primary"
              >
                ← Back to role selection
              </button>
            </div>
          )}

          <div className="mt-6 text-center text-sm">
            <span className="text-[#7F8C8D]">Already have an account? </span>
            <Link to="/login" className="text-[#2D6A4F] font-medium hover:underline">
              Sign in
            </Link>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
