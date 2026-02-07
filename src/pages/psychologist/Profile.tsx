import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Link } from 'react-router-dom';
import { getPsychologistById, type Psychologist } from '@/lib/firestore';
import { Star, Clock, MapPin, Award, Edit, Loader2, Globe, DollarSign } from 'lucide-react';

export default function PsychologistProfilePreview() {
  const { user } = useAuth();
  const [psychologist, setPsychologist] = useState<Psychologist | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProfile() {
        if (!user) return;
        try {
            const data = await getPsychologistById(user.uid);
            setPsychologist(data);
        } catch (error) {
            console.error('Error fetching profile:', error);
        } finally {
            setLoading(false);
        }
    }
    fetchProfile();
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!psychologist) {
    return (
        <div className="text-center py-12">
            <p className="text-text-muted">Profile not found.</p>
            <Link to="/psychologist/settings" className="btn btn-primary mt-4">Create Profile</Link>
        </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in max-w-5xl mx-auto">
        {/* Banner / Header */}
        <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-text">My Public Profile</h1>
            <Link to="/psychologist/settings" className="btn btn-primary flex items-center gap-2">
                <Edit className="w-4 h-4" />
                Edit Profile
            </Link>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Profile Info */}
          <div className="lg:col-span-2">
            {/* Header Card */}
            <div className="card mb-6 relative overflow-hidden">
              <div className="flex flex-col sm:flex-row gap-6 relative z-10">
                <div className="w-24 h-24 rounded-2xl bg-linear-to-br from-primary to-primary-light flex items-center justify-center text-white text-3xl font-bold shrink-0 shadow-lg">
                  {psychologist.displayName?.charAt(0)}
                </div>
                <div className="flex-1">
                  <h1 className="text-2xl font-bold text-text mb-1">{psychologist.displayName}</h1>
                  <p className="text-primary font-medium mb-2">{psychologist.title}</p>
                  <div className="flex items-center gap-4 text-sm text-text-muted">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                      <span className="font-bold text-text">{psychologist.rating || '5.0'}</span>
                      <span>({psychologist.reviewCount || 0} reviews)</span>
                    </div>
                    <div className="w-1 h-1 bg-gray-300 rounded-full" />
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {psychologist.yearsExperience || 0} years exp.
                    </div>
                    {psychologist.location && (
                        <>
                            <div className="w-1 h-1 bg-gray-300 rounded-full" />
                            <div className="flex items-center gap-1">
                                <MapPin className="w-4 h-4" />
                                {psychologist.location}
                            </div>
                        </>
                    )}
                  </div>
                  
                  {psychologist.languages && psychologist.languages.length > 0 && (
                      <div className="flex items-center gap-2 mt-3 text-sm text-text-muted">
                          <Globe className="w-4 h-4" />
                          <span>Speaks: {psychologist.languages.join(', ')}</span>
                      </div>
                  )}
                </div>
              </div>
            </div>

            {/* About */}
            <div className="card mb-6">
              <h2 className="text-lg font-bold text-text mb-4 flex items-center gap-2">
                <Award className="w-5 h-5 text-primary" />
                About Me
              </h2>
              <p className="text-text-muted leading-relaxed whitespace-pre-wrap">{psychologist.bio || 'No bio provided.'}</p>
              
              <div className="mt-6 pt-6 border-t border-border/50">
                <h3 className="font-bold text-text mb-2">Qualifications</h3>
                <p className="text-sm text-text-muted">{psychologist.qualifications || 'No qualifications listed.'}</p>
              </div>
            </div>

            {/* Specialties */}
            <div className="card">
              <h2 className="text-lg font-bold text-text mb-4">Specialties</h2>
              <div className="flex flex-wrap gap-2">
                {psychologist.specializations?.map((specialty, i) => (
                  <span key={i} className="badge badge-green">
                    {specialty}
                  </span>
                )) || <p className="text-text-muted text-sm">No specializations listed.</p>}
              </div>
            </div>
          </div>

          {/* Booking Panel Preview */}
          <div className="lg:col-span-1">
            <div className="card sticky top-24 opacity-80 pointer-events-none grayscale">
                <div className="absolute inset-0 z-10 flex items-center justify-center">
                    <span className="bg-black/70 text-white px-4 py-2 rounded-full text-sm font-bold">Student View Preview</span>
                </div>
              <h2 className="text-lg font-bold text-text mb-4">Book Appointment</h2>

              <div className="mb-6">
                <label className="block text-sm font-medium text-text mb-2">Session Type</label>
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-3 rounded-xl border border-primary bg-primary/5 text-center text-sm font-bold text-primary">
                    Video Call
                  </div>
                  <div className="p-3 rounded-xl border border-border text-center text-sm font-medium text-text-muted">
                    Chat
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-text mb-2">Select Date</label>
                <div className="grid grid-cols-7 gap-1">
                    {[1,2,3,4,5,6,7].map(i => (
                        <div key={i} className={`aspect-square rounded-lg flex flex-col items-center justify-center text-xs ${i === 2 ? 'bg-primary text-white' : 'bg-gray-100 text-text-muted'}`}>
                            <span className="font-bold">{i}</span>
                        </div>
                    ))}
                </div>
              </div>

              <button className="btn btn-primary w-full shadow-lg shadow-primary/20">
                Book Appointment
              </button>
              
              <div className="mt-4 flex items-center justify-center gap-1 text-sm font-bold text-text">
                  <DollarSign className="w-4 h-4 text-primary" />
                  {psychologist.sessionPrice || 0} / hour
              </div>
            </div>
          </div>
        </div>
    </div>
  );
}
