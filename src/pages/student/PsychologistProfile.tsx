import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Star, Clock, Calendar, MapPin, Award } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

const psychologist = {
  id: '1',
  name: 'Dr. Sarah Ahmed',
  title: 'Clinical Psychologist',
  bio: 'I am a clinical psychologist with over 8 years of experience helping university students navigate anxiety, depression, and academic stress. My approach combines evidence-based techniques with compassionate care.',
  qualifications: 'PhD Clinical Psychology, Licensed Therapist, CBT Certified',
  rating: 4.9,
  reviews: 47,
  experience: 8,
  specialties: ['Anxiety', 'Depression', 'Stress Management', 'Academic Performance', 'Self-Esteem'],
  location: 'El Taref University',
};

const timeSlots = ['09:00', '09:30', '10:00', '10:30', '11:00', '14:00', '14:30', '15:00', '15:30', '16:00'];

export default function PsychologistProfile() {
  useParams();
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [sessionType, setSessionType] = useState<'video' | 'chat'>('video');

  // Generate next 7 days
  const dates = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() + i);
    return date;
  });

  const handleBook = () => {
    if (selectedDate && selectedTime) {
      alert(`Booking ${sessionType} session with ${psychologist.name} on ${selectedDate} at ${selectedTime}`);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Profile Info */}
          <div className="lg:col-span-2">
            {/* Header Card */}
            <div className="card mb-6">
              <div className="flex flex-col sm:flex-row gap-6">
                <div className="w-24 h-24 rounded-2xl bg-primary flex items-center justify-center text-white text-3xl font-bold shrink-0">
                  {psychologist.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div className="flex-1">
                  <h1 className="text-2xl font-bold text-text mb-1">{psychologist.name}</h1>
                  <p className="text-text-muted mb-2">{psychologist.title}</p>
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                      <span className="font-medium">{psychologist.rating}</span>
                      <span className="text-text-muted">({psychologist.reviews} reviews)</span>
                    </div>
                    <div className="flex items-center gap-1 text-text-muted">
                      <Clock className="w-4 h-4" />
                      {psychologist.experience} years exp.
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* About */}
            <div className="card mb-6">
              <h2 className="text-lg font-semibold text-text mb-3 flex items-center gap-2">
                <Award className="w-5 h-5 text-primary" />
                About
              </h2>
              <p className="text-text-muted leading-relaxed">{psychologist.bio}</p>
              
              <div className="mt-4 pt-4 border-t border-border">
                <h3 className="font-medium text-text mb-2">Qualifications</h3>
                <p className="text-sm text-text-muted">{psychologist.qualifications}</p>
              </div>

              <div className="mt-4 flex items-center gap-2 text-sm text-text-muted">
                <MapPin className="w-4 h-4" />
                {psychologist.location}
              </div>
            </div>

            {/* Specialties */}
            <div className="card">
              <h2 className="text-lg font-semibold text-text mb-3">Specialties</h2>
              <div className="flex flex-wrap gap-2">
                {psychologist.specialties.map((specialty, i) => (
                  <span key={i} className="badge badge-green">
                    {specialty}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Booking Panel */}
          <div className="lg:col-span-1">
            <div className="card sticky top-24">
              <h2 className="text-lg font-semibold text-text mb-4">Book Appointment</h2>

              {/* Session Type */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-text mb-2">Session Type</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setSessionType('video')}
                    className={`p-3 rounded-lg border text-center text-sm font-medium transition-colors ${
                      sessionType === 'video' 
                        ? 'border-primary bg-success text-primary' 
                        : 'border-border text-text-muted hover:border-primary'
                    }`}
                  >
                    Video Call
                  </button>
                  <button
                    onClick={() => setSessionType('chat')}
                    className={`p-3 rounded-lg border text-center text-sm font-medium transition-colors ${
                      sessionType === 'chat' 
                        ? 'border-primary bg-success text-primary' 
                        : 'border-border text-text-muted hover:border-primary'
                    }`}
                  >
                    Chat
                  </button>
                </div>
              </div>

              {/* Date Selection */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-text mb-2">Select Date</label>
                <div className="grid grid-cols-7 gap-1">
                  {dates.map((date, i) => {
                    const dateStr = date.toISOString().split('T')[0];
                    const isSelected = selectedDate === dateStr;
                    return (
                      <button
                        key={i}
                        onClick={() => setSelectedDate(dateStr)}
                        className={`p-2 rounded-lg text-center text-xs transition-colors ${
                          isSelected 
                            ? 'bg-primary text-white' 
                            : 'hover:bg-gray-100'
                        }`}
                      >
                        <div className="text-[10px] uppercase">{date.toLocaleDateString('en', { weekday: 'narrow' })}</div>
                        <div className="font-semibold">{date.getDate()}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Time Selection */}
              {selectedDate && (
                <div className="mb-6">
                  <label className="block text-sm font-medium text-text mb-2">Select Time</label>
                  <div className="grid grid-cols-3 gap-2">
                    {timeSlots.map((time) => (
                      <button
                        key={time}
                        onClick={() => setSelectedTime(time)}
                        className={`p-2 rounded-lg text-sm font-medium transition-colors ${
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

              {/* Book Button */}
              <button
                onClick={handleBook}
                disabled={!selectedDate || !selectedTime}
                className="btn btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Calendar className="w-4 h-4" />
                Book Appointment
              </button>

              <p className="text-xs text-center text-text-muted mt-4">
                Free for El Taref University students
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
