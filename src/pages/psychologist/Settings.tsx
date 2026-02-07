import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getPsychologistById, updatePsychologistProfile, type Psychologist } from '@/lib/firestore';
import { 
  Save, 
  Loader2, 
  User, 
  MapPin, 
  DollarSign, 
  Clock, 
  BookOpen, 
  Globe 
} from 'lucide-react';

export default function PsychologistSettings() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<Partial<Psychologist>>({});

  useEffect(() => {
    async function fetchProfile() {
      if (!user) return;
      try {
        const data = await getPsychologistById(user.uid);
        if (data) {
            setFormData(data);
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchProfile();
  }, [user]);

  const handleChange = (field: keyof Psychologist, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleArrayChange = (field: 'specializations' | 'languages', value: string) => {
    // Split by comma and trim
    const array = value.split(',').map(item => item.trim()).filter(Boolean);
    setFormData(prev => ({ ...prev, [field]: array }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setSaving(true);
    try {
      await updatePsychologistProfile(user.uid, formData);
      // Optional: Show toast or success message
      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  const isVerified = formData.verificationStatus === 'approved';
  const isRejected = formData.verificationStatus === 'rejected';

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text">Profile Settings</h1>
          <p className="text-text-muted">Manage your public profile and account settings</p>
        </div>
        <button 
          onClick={handleSubmit} 
          disabled={saving || !isVerified}
          className="btn btn-primary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Save Changes
        </button>
      </div>

      {/* Verification Status Banner */}
      {!isVerified && (
        <div className={`p-4 rounded-xl border ${
          isRejected ? 'bg-red-50 border-red-200 text-red-800' : 'bg-yellow-50 border-yellow-200 text-yellow-800'
        }`}>
          <div className="flex items-start gap-3">
            <div className={`p-2 rounded-full ${isRejected ? 'bg-red-100' : 'bg-yellow-100'}`}>
               {isRejected ? <User className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="font-bold mb-1">
                {isRejected ? 'Application Rejected' : 'Verification Pending'}
              </h3>
              <p className="text-sm opacity-90">
                {isRejected 
                  ? `Your application was rejected. Reason: ${formData.rejectionReason || 'Not specified'}. Please contact support.`
                  : 'Your profile is currently under review by the administration. You will be able to edit your details once approved.'}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-8">
        
        {/* Left Column: Basic Preview */}
        <div className="lg:col-span-1 space-y-6">
          <div className="card text-center">
            <div className="w-32 h-32 rounded-full bg-linear-to-br from-primary to-primary-light flex items-center justify-center text-white text-4xl font-bold mx-auto mb-4 border-4 border-white shadow-lg">
                {formData.displayName?.charAt(0) || user?.email?.charAt(0)}
            </div>
            <h2 className="text-xl font-bold text-text">{formData.displayName || 'Your Name'}</h2>
            <p className="text-primary font-medium">{formData.title || 'Psychologist'}</p>
            
            <div className="mt-6 flex flex-col gap-2 text-sm text-text-muted">
                <div className="flex items-center justify-center gap-2">
                    <MapPin className="w-4 h-4" />
                    {formData.location || 'Location not set'}
                </div>
                <div className="flex items-center justify-center gap-2">
                    <DollarSign className="w-4 h-4" />
                    ${formData.sessionPrice || 0}/hour
                </div>
            </div>
          </div>
          
          <div className="card bg-blue-50 border-blue-100">
            <h3 className="font-semibold text-blue-900 mb-2">Availability Status</h3>
            <div className="flex items-center justify-between">
                <span className="text-sm text-blue-700">Accepting new patients</span>
                <button 
                    onClick={() => isVerified && handleChange('isAvailable', !formData.isAvailable)}
                    disabled={!isVerified}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        formData.isAvailable ? 'bg-primary' : 'bg-gray-300'
                    } ${!isVerified ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                >
                    <span 
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            formData.isAvailable ? 'translate-x-6' : 'translate-x-1'
                        }`} 
                    />
                </button>
            </div>
          </div>
        </div>

        {/* Right Column: Edit Form */}
        <div className="lg:col-span-2 space-y-6">
            
            {/* Basic Info */}
            <div className="card">
                <h3 className="text-lg font-bold text-text mb-4 flex items-center gap-2">
                    <User className="w-5 h-5 text-primary" />
                    Basic Information
                </h3>
                <div className="grid gap-4">
                    <div>
                        <label className="label">Full Name</label>
                        <input 
                            type="text" 
                            className="input disabled:opacity-60 disabled:bg-gray-50" 
                            value={formData.displayName || ''} 
                            onChange={(e) => handleChange('displayName', e.target.value)}
                            disabled={!isVerified}
                        />
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                        <div>
                            <label className="label">Professional Title</label>
                            <input 
                                type="text" 
                                className="input disabled:opacity-60 disabled:bg-gray-50" 
                                placeholder="e.g. Clinical Psychologist"
                                value={formData.title || ''} 
                                onChange={(e) => handleChange('title', e.target.value)}
                                disabled={!isVerified}
                            />
                        </div>
                        <div>
                            <label className="label">Location</label>
                            <input 
                                type="text" 
                                className="input disabled:opacity-60 disabled:bg-gray-50" 
                                placeholder="e.g. Algiers"
                                value={formData.location || ''} 
                                onChange={(e) => handleChange('location', e.target.value)}
                                disabled={!isVerified}
                            />
                        </div>
                    </div>
                    <div>
                        <label className="label">Languages Spoken</label>
                        <div className="relative">
                            <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                            <input 
                                type="text" 
                                className="input pl-10 disabled:opacity-60 disabled:bg-gray-50" 
                                placeholder="English, Arabic, French (comma separated)"
                                value={formData.languages?.join(', ') || ''} 
                                onChange={(e) => handleArrayChange('languages', e.target.value)}
                                disabled={!isVerified}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Professional Details */}
            <div className="card">
                <h3 className="text-lg font-bold text-text mb-4 flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-primary" />
                    Professional Details
                </h3>
                <div className="grid gap-4">
                    <div>
                        <label className="label">Bio</label>
                        <textarea 
                            className="input min-h-[120px] disabled:opacity-60 disabled:bg-gray-50" 
                            placeholder="Tell students about your experience and approach..."
                            value={formData.bio || ''}
                            onChange={(e) => handleChange('bio', e.target.value)}
                            disabled={!isVerified}
                        />
                    </div>
                    <div>
                        <label className="label">Qualifications</label>
                        <textarea 
                            className="input disabled:opacity-60 disabled:bg-gray-50" 
                            placeholder="PhD in Psychology, Licensed Therapist..."
                            value={formData.qualifications || ''}
                            onChange={(e) => handleChange('qualifications', e.target.value)}
                            disabled={!isVerified}
                        />
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                        <div>
                            <label className="label">Years of Experience</label>
                            <div className="relative">
                                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                                <input 
                                    type="number" 
                                    className="input pl-10 disabled:opacity-60 disabled:bg-gray-50" 
                                    value={formData.yearsExperience || 0} 
                                    onChange={(e) => handleChange('yearsExperience', parseInt(e.target.value) || 0)}
                                    disabled={!isVerified}
                                />
                            </div>
                        </div>
                        <div>
                            <label className="label">Hourly Rate ($)</label>
                            <div className="relative">
                                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                                <input 
                                    type="number" 
                                    className="input pl-10 disabled:opacity-60 disabled:bg-gray-50" 
                                    value={formData.sessionPrice || 0} 
                                    onChange={(e) => handleChange('sessionPrice', parseInt(e.target.value) || 0)}
                                    disabled={!isVerified}
                                />
                            </div>
                        </div>
                    </div>
                    <div>
                        <label className="label">Specializations</label>
                        <input 
                            type="text" 
                            className="input disabled:opacity-60 disabled:bg-gray-50" 
                            placeholder="Anxiety, Depression, Trauma (comma separated)"
                            value={formData.specializations?.join(', ') || ''} 
                            onChange={(e) => handleArrayChange('specializations', e.target.value)}
                            disabled={!isVerified}
                        />
                        <p className="text-xs text-text-muted mt-1">Separate keywords with commas</p>
                    </div>
                </div>
            </div>

        </div>
      </div>
    </div>
  );
}
