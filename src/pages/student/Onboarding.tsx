import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, GraduationCap, Stethoscope, Globe, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export default function Onboarding() {
  const navigate = useNavigate();
  const { profile, updateUserProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    studentId: '',
    department: '',
    bio: '',
    qualifications: '',
    yearsExperience: '',
    language: 'en' as 'en' | 'fr' | 'ar',
  });

  const isStudent = profile?.role === 'student';
  const isPsychologist = profile?.role === 'psychologist';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await updateUserProfile({
        ...(isStudent && { studentId: formData.studentId, department: formData.department }),
        ...(isPsychologist && { 
          bio: formData.bio, 
          qualifications: formData.qualifications, 
          yearsExperience: parseInt(formData.yearsExperience) || 0 
        }),
        preferredLanguage: formData.language,
      });
      navigate('/dashboard');
    } catch (err) {
      console.error('Failed to update profile:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-success mb-4">
            <Sparkles className="w-6 h-6 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-text mb-2">Complete Your Profile</h1>
          <p className="text-text-muted">Just a few more details to get started</p>
        </div>

        <div className="card">
          {/* Role Badge */}
          <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl mb-6">
            {isStudent ? (
              <GraduationCap className="w-6 h-6 text-primary" />
            ) : (
              <Stethoscope className="w-6 h-6 text-primary" />
            )}
            <div>
              <p className="font-medium text-text">
                {isStudent ? 'Student Account' : 'Psychologist Account'}
              </p>
              <p className="text-sm text-text-muted">{profile?.email}</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Student Fields */}
            {isStudent && (
              <>
                <div>
                  <label className="block text-sm font-medium text-text mb-1">Student ID</label>
                  <input
                    type="text"
                    value={formData.studentId}
                    onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                    placeholder="e.g. 202412345"
                    className="input"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text mb-1">Department</label>
                  <input
                    type="text"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    placeholder="e.g. Computer Science"
                    className="input"
                    required
                  />
                </div>
              </>
            )}

            {/* Psychologist Fields */}
            {isPsychologist && (
              <>
                <div>
                  <label className="block text-sm font-medium text-text mb-1">Professional Bio</label>
                  <textarea
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    placeholder="Tell students about yourself..."
                    className="input min-h-[80px] resize-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text mb-1">Qualifications</label>
                  <textarea
                    value={formData.qualifications}
                    onChange={(e) => setFormData({ ...formData, qualifications: e.target.value })}
                    placeholder="PhD in Clinical Psychology..."
                    className="input min-h-[60px] resize-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text mb-1">Years of Experience</label>
                  <input
                    type="number"
                    value={formData.yearsExperience}
                    onChange={(e) => setFormData({ ...formData, yearsExperience: e.target.value })}
                    placeholder="5"
                    className="input"
                    required
                  />
                </div>
              </>
            )}

            {/* Language */}
            <div>
              <label className="block text-sm font-medium text-text mb-1">
                <Globe className="w-4 h-4 inline mr-1" />
                Preferred Language
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { value: 'en' as const, label: 'English' },
                  { value: 'fr' as const, label: 'Français' },
                  { value: 'ar' as const, label: 'العربية' },
                ].map((lang) => (
                  <button
                    key={lang.value}
                    type="button"
                    onClick={() => setFormData({ ...formData, language: lang.value })}
                    className={`p-3 rounded-lg border text-center text-sm transition-colors ${
                      formData.language === lang.value
                        ? 'border-primary bg-success text-primary font-medium'
                        : 'border-border text-text-muted hover:border-primary'
                    }`}
                  >
                    {lang.label}
                  </button>
                ))}
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn btn-primary w-full">
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Complete Setup'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
