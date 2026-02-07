import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Star, Clock, Calendar, MapPin, Award, Loader2, Globe, DollarSign, MessageSquare } from 'lucide-react';
import { getPsychologistById, getConversationId, type Psychologist } from '@/lib/firestore';
import { useAuth } from '@/contexts/AuthContext';

const timeSlots = ['09:00', '09:30', '10:00', '10:30', '11:00', '14:00', '14:30', '15:00', '15:30', '16:00'];

export default function PsychologistProfile() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [psychologist, setPsychologist] = useState<Psychologist | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [sessionType, setSessionType] = useState<'video' | 'chat'>('video');

  useEffect(() => {
    async function fetchProfile() {
      if (!id) return;
      try {
        const data = await getPsychologistById(id);
        setPsychologist(data);
      } catch (error) {
        console.error('Error fetching psychologist:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchProfile();
  }, [id]);

  // Generate next 7 days
  const dates = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() + i);
    return date;
  });



  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!psychologist) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <h2 className="text-xl font-bold text-text mb-2">Psychologist not found</h2>
        <p className="text-text-muted mb-6">The specialist you are looking for does not exist or is unavailable.</p>
        <Link to="/student/psychologists" className="btn btn-secondary">Back to Directory</Link>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in text-left">
        <div className="grid lg:grid-cols-3 gap-8 text-left">
          {/* Profile Info */}
          <div className="lg:col-span-2 text-left">
            {/* Header Card */}
            <div className="card mb-6">
              <div className="flex flex-col sm:flex-row gap-6">
                <div className="w-24 h-24 rounded-2xl bg-linear-to-br from-primary to-primary-light flex items-center justify-center text-white text-3xl font-bold shrink-0 shadow-lg">
                  {psychologist.photoURL ? (
                      <img src={psychologist.photoURL} alt={psychologist.displayName} className="w-full h-full object-cover rounded-2xl" />
                  ) : (
                      psychologist.displayName.charAt(0)
                  )}
                </div>
                <div className="flex-1 text-left">
                  <h1 className="text-2xl font-bold text-text mb-1">{psychologist.displayName}</h1>
                  <p className="text-primary font-bold mb-2">{psychologist.title}</p>
                  <div className="flex items-center gap-4 text-sm text-text-muted">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                      <span className="font-bold text-text">{psychologist.rating || '5.0'}</span>
                      <span>({psychologist.reviewCount || 0} reviews)</span>
                    </div>
                    <div className="w-1 h-1 bg-gray-300 rounded-full" />
                    <div className="flex items-center gap-1 font-medium">
                      <Clock className="w-4 h-4" />
                      {psychologist.yearsExperience || 0} years exp.
                    </div>
                    {psychologist.location && (
                        <>
                            <div className="w-1 h-1 bg-gray-300 rounded-full" />
                            <div className="flex items-center gap-1 font-medium">
                                <MapPin className="w-4 h-4" />
                                {psychologist.location}
                            </div>
                        </>
                    )}
                  </div>
                   {psychologist.languages && psychologist.languages.length > 0 && (
                      <div className="flex items-center gap-2 mt-3 text-sm text-text-muted font-medium">
                          <Globe className="w-4 h-4" />
                          <span>Speaks: {psychologist.languages.join(', ')}</span>
                      </div>
                  )}
                </div>
              </div>
            </div>

            {/* About */}
            <div className="card mb-6 text-left">
              <h2 className="text-lg font-bold text-text mb-4 flex items-center gap-2">
                <Award className="w-5 h-5 text-primary" />
                About
              </h2>
              <p className="text-text-muted leading-relaxed whitespace-pre-wrap">{psychologist.bio}</p>
              
              <div className="mt-6 pt-6 border-t border-border/50">
                <h3 className="font-bold text-text mb-2">Qualifications</h3>
                <p className="text-sm text-text-muted">{psychologist.qualifications}</p>
              </div>
            </div>

            {/* Specialties */}
            <div className="card text-left">
              <h2 className="text-lg font-bold text-text mb-4">Specialties</h2>
              <div className="flex flex-wrap gap-2">
                {psychologist.specializations?.map((specialty, i) => (
                  <span key={i} className="badge badge-green">
                    {specialty}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Booking Panel */}
          <div className="lg:col-span-1 text-left">
            <div className="card sticky top-24">
              <h2 className="text-lg font-bold text-text mb-4">Book Appointment</h2>

              {/* Session Type */}
              <div className="mb-6">
                <label className="block text-sm font-bold text-text mb-2">Session Type</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setSessionType('video')}
                    className={`p-3 rounded-xl border text-center text-sm font-bold transition-all ${
                      sessionType === 'video' 
                        ? 'border-primary bg-primary/5 text-primary' 
                        : 'border-border text-text-muted hover:border-primary/50'
                    }`}
                  >
                    Video Call
                  </button>
                  <button
                    onClick={() => setSessionType('chat')}
                    className={`p-3 rounded-xl border text-center text-sm font-bold transition-all ${
                      sessionType === 'chat' 
                        ? 'border-primary bg-primary/5 text-primary' 
                        : 'border-border text-text-muted hover:border-primary/50'
                    }`}
                  >
                    Chat
                  </button>
                </div>
              </div>

              {/* Date Selection */}
              <div className="mb-6">
                <label className="block text-sm font-bold text-text mb-2">Select Date</label>
                <div className="grid grid-cols-7 gap-1">
                  {dates.map((date, i) => {
                    const dateStr = date.toISOString().split('T')[0];
                    const isSelected = selectedDate === dateStr;
                    return (
                      <button
                        key={i}
                        onClick={() => setSelectedDate(dateStr)}
                        className={`aspect-square rounded-lg flex flex-col items-center justify-center text-xs transition-colors ${
                          isSelected 
                            ? 'bg-primary text-white shadow-md' 
                            : 'hover:bg-gray-100'
                        }`}
                      >
                        <div className="text-[10px] uppercase font-bold opacity-70">{date.toLocaleDateString('en', { weekday: 'narrow' })}</div>
                        <div className="font-bold">{date.getDate()}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Time Selection */}
              {selectedDate && (
                <div className="mb-6 animate-in fade-in slide-in-from-top-2">
                  <label className="block text-sm font-bold text-text mb-2">Select Time</label>
                  <div className="grid grid-cols-3 gap-2">
                    {timeSlots.map((time) => (
                      <button
                        key={time}
                        onClick={() => setSelectedTime(time)}
                        className={`py-2 rounded-lg text-sm font-medium transition-colors ${
                          selectedTime === time 
                            ? 'bg-primary text-white shadow-md' 
                            : 'bg-gray-100 text-text hover:bg-gray-200'
                        }`}
                      >
                        {time}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Book Button */}
              <Link
                to={`/student/book/${psychologist.uid}`}
                onClick={(e) => {
                    if (!selectedDate || !selectedTime) {
                        e.preventDefault();
                    }
                }}
                className={`btn btn-primary w-full flex items-center justify-center gap-2 ${(!selectedDate || !selectedTime) ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''}`}
              >
                <Calendar className="w-4 h-4" />
                Book Appointment
              </Link>
              
              {/* Direct Message Button */}
              <button
                onClick={() => {
                  if (user && psychologist) {
                    const conversationId = getConversationId(user.uid, psychologist.uid);
                    navigate(`/student/messages/${conversationId}`);
                  }
                }}
                className="btn btn-secondary w-full flex items-center justify-center gap-2 mt-3"
              >
                <MessageSquare className="w-4 h-4" />
                Send Message
              </button>
              
               <div className="mt-4 flex items-center justify-center gap-1 text-sm font-bold text-text">
                  <DollarSign className="w-4 h-4 text-primary" />
                  {psychologist.sessionPrice || 75} / hour
              </div>

              <p className="text-xs text-center text-text-muted mt-4 font-medium">
                Free for El Taref University students
              </p>
            </div>
          </div>
        </div>
    </div>
  );
}
