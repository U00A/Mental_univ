import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Video, 
  MessageSquare, 
  ChevronLeft,
  CheckCircle2,
  Loader2,
  CreditCard,
  Shield
} from 'lucide-react';

import { useAuth } from '@/contexts/AuthContext';
import { getPsychologistById, createAppointment } from '@/lib/firestore';
import type { Psychologist } from '@/lib/firestore';

const timeSlots = [
  '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00'
];

const sessionTypes = [
  { id: 'video', label: 'Video Call', icon: Video, duration: 50, price: 75 },
  { id: 'chat', label: 'Text Chat', icon: MessageSquare, duration: 30, price: 45 },
];

export default function Booking() {
  const { psychologistId } = useParams();
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const [psychologist, setPsychologist] = useState<Psychologist | null>(null);
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);
  const [step, setStep] = useState(1);
  
  // Booking details
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [sessionType, setSessionType] = useState<'video' | 'chat'>('video');
  const [concerns, setConcerns] = useState('');
  const [goals, setGoals] = useState('');

  useEffect(() => {
    async function fetchPsychologist() {
      if (!psychologistId) return;
      try {
        const data = await getPsychologistById(psychologistId);
        setPsychologist(data);
      } catch (error) {
        console.error('Failed to fetch psychologist:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchPsychologist();
  }, [psychologistId]);

  const generateCalendarDays = () => {
    const days = [];
    const today = new Date();
    for (let i = 0; i < 14; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      days.push(date);
    }
    return days;
  };

  const handleBooking = async () => {
    if (!user || !psychologist || !selectedDate || !selectedTime) return;
    
    setBooking(true);
    try {
      const sessionInfo = sessionTypes.find(s => s.id === sessionType)!;
      
      await createAppointment({
        studentId: user.uid,
        psychologistId: psychologist.uid,
        studentName: profile?.displayName || 'Student',
        psychologistName: psychologist.displayName,
        date: selectedDate,
        time: selectedTime,
        duration: sessionInfo.duration,
        status: 'pending',
        type: sessionType,
        preSessionConcerns: concerns,
        goals: goals
      });
      
      setStep(4); // Success step
    } catch (error) {
      console.error('Booking failed:', error);
      alert('Failed to book appointment. Please try again.');
    } finally {
      setBooking(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!psychologist) {
    return (
      <div className="flex-1 flex items-center justify-center py-20">
        <p className="text-text-muted">Psychologist not found</p>
      </div>
    );
  }

  const calendarDays = generateCalendarDays();
  const sessionInfo = sessionTypes.find(s => s.id === sessionType)!;

  return (
    <div className="space-y-8 animate-fade-in max-w-4xl">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-text-muted hover:text-text mb-6"
        >
          <ChevronLeft className="w-5 h-5" />
          Back
        </button>

        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-8">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                step >= s ? 'bg-primary text-white' : 'bg-gray-200 text-text-muted'
              }`}>
                {step > s ? <CheckCircle2 className="w-5 h-5" /> : s}
              </div>
              {s < 3 && (
                <div className={`w-16 h-1 mx-2 ${step > s ? 'bg-primary' : 'bg-gray-200'}`} />
              )}
            </div>
          ))}
        </div>

        {step === 4 ? (
          /* Success Screen */
          <div className="card text-center py-12">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-10 h-10 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-text mb-3">Booking Confirmed!</h2>
            <p className="text-text-muted mb-6">
              Your appointment with {psychologist.displayName} has been scheduled for
            </p>
            <div className="bg-gray-50 rounded-xl p-4 mb-6 max-w-md mx-auto">
              <p className="font-semibold text-text">
                {selectedDate?.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
              </p>
              <p className="text-text-muted">at {selectedTime}</p>
            </div>
            <p className="text-sm text-text-muted mb-6">
              You'll receive a confirmation email shortly. The session link will be available 15 minutes before your appointment.
            </p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => navigate('/student/appointments')}
                className="btn btn-primary"
              >
                View My Appointments
              </button>
              <button
                onClick={() => navigate('/student/dashboard')}
                className="btn btn-secondary"
              >
                Go to Dashboard
              </button>
            </div>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              {step === 1 && (
                <div className="space-y-6">
                  {/* Session Type */}
                  <div className="card">
                    <h2 className="text-lg font-semibold text-text mb-4">Select Session Type</h2>
                    <div className="grid grid-cols-2 gap-4">
                      {sessionTypes.map((type) => (
                        <button
                          key={type.id}
                          onClick={() => setSessionType(type.id as 'video' | 'chat')}
                          className={`p-4 rounded-xl border-2 text-left transition-all ${
                            sessionType === type.id
                              ? 'border-primary bg-primary/5'
                              : 'border-gray-200 hover:border-primary/50'
                          }`}
                        >
                          <type.icon className={`w-6 h-6 mb-2 ${sessionType === type.id ? 'text-primary' : 'text-text-muted'}`} />
                          <p className="font-semibold text-text">{type.label}</p>
                          <p className="text-sm text-text-muted">{type.duration} minutes</p>
                          <p className="text-lg font-bold text-primary mt-2">${type.price}</p>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Date Selection */}
                  <div className="card">
                    <h2 className="text-lg font-semibold text-text mb-4">Select Date</h2>
                    <div className="grid grid-cols-7 gap-2">
                      {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                        <div key={day} className="text-center text-xs text-text-muted font-medium py-2">
                          {day}
                        </div>
                      ))}
                      {calendarDays.map((date, index) => (
                        <button
                          key={index}
                          onClick={() => setSelectedDate(date)}
                          className={`aspect-square rounded-lg flex flex-col items-center justify-center text-sm transition-colors ${
                            selectedDate?.toDateString() === date.toDateString()
                              ? 'bg-primary text-white'
                              : 'hover:bg-gray-100'
                          }`}
                        >
                          <span className="text-xs opacity-70">
                            {date.toLocaleDateString(undefined, { month: 'short' })}
                          </span>
                          <span className="font-semibold">{date.getDate()}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Time Selection */}
                  {selectedDate && (
                    <div className="card animate-in fade-in">
                      <h2 className="text-lg font-semibold text-text mb-4">
                        Available Times for {selectedDate.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
                      </h2>
                      <div className="grid grid-cols-4 gap-3">
                        {timeSlots.map((time) => (
                          <button
                            key={time}
                            onClick={() => setSelectedTime(time)}
                            className={`py-2 px-4 rounded-lg font-medium transition-colors ${
                              selectedTime === time
                                ? 'bg-primary text-white'
                                : 'bg-gray-100 text-text hover:bg-gray-200'
                            }`}
                          >
                            {time}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {step === 2 && (
                <div className="card space-y-6">
                  <h2 className="text-lg font-semibold text-text">Pre-Session Information</h2>
                  
                  <div>
                    <label className="text-sm font-medium text-text-muted mb-2 block">
                      What brings you to therapy? (optional)
                    </label>
                    <textarea
                      value={concerns}
                      onChange={(e) => setConcerns(e.target.value)}
                      placeholder="Briefly describe what you'd like to discuss..."
                      rows={4}
                      className="input resize-none"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-text-muted mb-2 block">
                      What are your goals for this session? (optional)
                    </label>
                    <textarea
                      value={goals}
                      onChange={(e) => setGoals(e.target.value)}
                      placeholder="What would you like to achieve?"
                      rows={3}
                      className="input resize-none"
                    />
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-sm text-blue-700">
                      <strong>Privacy Note:</strong> This information will only be shared with {psychologist.displayName} 
                      to help them prepare for your session. It is completely confidential.
                    </p>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="card space-y-6">
                  <h2 className="text-lg font-semibold text-text">Review & Confirm</h2>
                  
                  <div className="space-y-4">
                    <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                      <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white font-bold">
                        {psychologist.displayName.charAt(0)}
                      </div>
                      <div>
                        <p className="font-semibold text-text">{psychologist.displayName}</p>
                        <p className="text-sm text-text-muted">{psychologist.title}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <p className="text-sm text-text-muted mb-1">Date & Time</p>
                        <p className="font-medium text-text">
                          {selectedDate?.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                        </p>
                        <p className="text-text">{selectedTime}</p>
                      </div>
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <p className="text-sm text-text-muted mb-1">Session Type</p>
                        <p className="font-medium text-text">{sessionInfo.label}</p>
                        <p className="text-text">{sessionInfo.duration} minutes</p>
                      </div>
                    </div>

                    {concerns && (
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <p className="text-sm text-text-muted mb-1">Your Concerns</p>
                        <p className="text-sm text-text">{concerns}</p>
                      </div>
                    )}
                  </div>

                  <div className="border-t border-gray-200 pt-4">
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-text-muted">Session Fee</span>
                      <span className="text-xl font-bold text-text">${sessionInfo.price}</span>
                    </div>
                    <p className="text-xs text-text-muted mb-4">
                      Payment will be processed after the session is completed.
                    </p>
                  </div>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex gap-3 mt-6">
                {step > 1 && (
                  <button
                    onClick={() => setStep(step - 1)}
                    className="btn btn-secondary flex-1"
                  >
                    Back
                  </button>
                )}
                <button
                  onClick={() => {
                    if (step === 3) {
                      handleBooking();
                    } else {
                      setStep(step + 1);
                    }
                  }}
                  disabled={
                    (step === 1 && (!selectedDate || !selectedTime)) ||
                    booking
                  }
                  className="btn btn-primary flex-1 flex items-center justify-center gap-2"
                >
                  {booking ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : step === 3 ? (
                    <>
                      <CreditCard className="w-5 h-5" />
                      Confirm Booking
                    </>
                  ) : (
                    'Continue'
                  )}
                </button>
              </div>
            </div>

            {/* Sidebar - Summary */}
            <div className="lg:col-span-1">
              <div className="card sticky top-4">
                <h3 className="font-semibold text-text mb-4">Booking Summary</h3>
                
                <div className="flex items-center gap-3 mb-4 pb-4 border-b border-gray-100">
                  <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white font-bold">
                    {psychologist.displayName.charAt(0)}
                  </div>
                  <div>
                    <p className="font-medium text-text">{psychologist.displayName}</p>
                    <p className="text-sm text-text-muted">{psychologist.title}</p>
                  </div>
                </div>

                <div className="space-y-3 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-text-muted">Session Type</span>
                    <span className="text-text">{sessionInfo.label}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-text-muted">Duration</span>
                    <span className="text-text">{sessionInfo.duration} min</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-text-muted">Date</span>
                    <span className="text-text">
                      {selectedDate ? selectedDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : '-'}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-text-muted">Time</span>
                    <span className="text-text">{selectedTime || '-'}</span>
                  </div>
                </div>

                <div className="border-t border-gray-100 pt-4">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-text">Total</span>
                    <span className="text-2xl font-bold text-primary">${sessionInfo.price}</span>
                  </div>
                </div>

                <div className="mt-4 flex items-center gap-2 text-xs text-text-muted">
                  <Shield className="w-4 h-4" />
                  <span>Secure & confidential</span>
                </div>
              </div>
            </div>
          </div>
        )}
    </div>
  );
}
