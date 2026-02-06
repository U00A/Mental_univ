import { useState } from 'react';
import { Send, Sparkles, Brain } from 'lucide-react';
import { logMood } from '@/lib/firestore';
import { useAuth } from '@/contexts/AuthContext';

const MOODS = [
  { id: 'very_bad', label: 'Very Bad', icon: '😭', color: 'bg-red-100 text-red-600', suggestion: 'It sounds like you are going through a lot. Please consider using the Panic Helper or calling 988 if you need immediate support.' },
  { id: 'bad', label: 'Bad', icon: '😔', color: 'bg-orange-100 text-orange-600', suggestion: 'Taking a 5-minute break for some deep breathing might help clear your mind. Check out the Panic Helper tool.' },
  { id: 'neutral', label: 'Neutral', icon: '😐', color: 'bg-gray-100 text-gray-600', suggestion: 'How about a quick walk or listening to your favorite playlist? A small change in environment can boost your mood.' },
  { id: 'good', label: 'Good', icon: '🙂', color: 'bg-green-100 text-green-600', suggestion: 'That is great! Why not jot down one thing you are grateful for today in your journal?' },
  { id: 'very_good', label: 'Great', icon: '🤩', color: 'bg-primary/20 text-primary', suggestion: 'Wonderful! Keep this positive energy going. Maybe share some kindness with someone else today.' },
];

export default function WellnessCheckin() {
  const { user } = useAuth();
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleMoodSelect = async (moodId: string) => {
    if (!user) return;
    setSelectedMood(moodId);
  };

  const handleSubmit = async () => {
    if (!user || !selectedMood) return;
    
    setLoading(true);
    try {
      await logMood({
        userId: user.uid,
        mood: selectedMood as any,
        date: new Date()
      });
      setSubmitted(true);
      // Logged successfully
    } catch (err) {
      console.error('Error logging mood:', err);
      console.error('Failed to log mood');
    } finally {
      setLoading(false);
    }
  };

  const currentSuggestion = MOODS.find(m => m.id === selectedMood)?.suggestion;

  return (
    <div className="card-glass border-none p-8 rounded-[2rem] overflow-hidden relative group">
      <div className="relative z-10">
        {!submitted ? (
          <>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-text">Daily Wellness Check-in</h2>
                <p className="text-sm text-text-muted font-medium">How are you feeling right now?</p>
              </div>
            </div>

            <div className="grid grid-cols-5 gap-3 mb-8">
              {MOODS.map((mood) => (
                <button
                  key={mood.id}
                  onClick={() => handleMoodSelect(mood.id)}
                  className={`flex flex-col items-center p-4 rounded-2xl transition-all duration-300 active:scale-95 ${
                    selectedMood === mood.id 
                      ? `${mood.color} ring-2 ring-current ring-offset-2 scale-105 shadow-lg` 
                      : 'bg-white/50 hover:bg-white text-text-muted hover:text-text'
                  }`}
                >
                  <span className="text-3xl mb-2">{mood.icon}</span>
                  <span className="text-[10px] font-bold uppercase tracking-wider">{mood.label}</span>
                </button>
              ))}
            </div>

            <button
              onClick={handleSubmit}
              disabled={!selectedMood || loading}
              className="btn-primary w-full justify-center group active:scale-[0.98]"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  Log Mood & Get Insight
                  <Send className="w-4 h-4 ml-2 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                </>
              )}
            </button>
          </>
        ) : (
          <div className="text-center py-6 animate-in fade-in zoom-in-95 duration-500">
            <div className="w-20 h-20 rounded-3xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
              <Sparkles className="w-10 h-10 text-primary" />
            </div>
            <h2 className="text-2xl font-bold text-text mb-4">You're All Set!</h2>
            <div className="bg-white/50 p-6 rounded-2xl border border-primary/10 inline-block text-left relative overflow-hidden">
                <div className="absolute top-0 right-0 p-2 opacity-10">
                    <Brain className="w-12 h-12" />
                </div>
                <p className="text-primary font-bold text-sm uppercase mb-2 tracking-widest flex items-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    Today's Insight
                </p>
                <p className="text-lg text-text font-medium leading-relaxed italic">
                    "{currentSuggestion}"
                </p>
            </div>
            <button 
                onClick={() => setSubmitted(false)}
                className="mt-8 text-sm font-bold text-text-muted hover:text-text transition-colors"
            >
                LOG ANOTHER FEELING
            </button>
          </div>
        )}
      </div>

      {/* Background Decor */}
      <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/10 transition-colors duration-700" />
      <div className="absolute -top-12 -left-12 w-32 h-32 bg-accent/5 rounded-full blur-3xl group-hover:bg-accent/10 transition-colors duration-700" />
    </div>
  );
}
