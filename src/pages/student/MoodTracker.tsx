import { useState, useEffect, useCallback } from 'react';
import { Calendar, TrendingUp } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { useAuth } from '@/contexts/AuthContext';
import { logMood, getMoodHistory } from '@/lib/firestore';
import type { MoodEntry } from '@/lib/firestore';

const moods = [
  { value: 'very_good', emoji: '😄', label: 'Great', color: 'bg-green-100 text-green-700', score: 5 },
  { value: 'good', emoji: '🙂', label: 'Good', color: 'bg-blue-100 text-blue-700', score: 4 },
  { value: 'neutral', emoji: '😐', label: 'Okay', color: 'bg-yellow-100 text-yellow-700', score: 3 },
  { value: 'bad', emoji: '😔', label: 'Bad', color: 'bg-orange-100 text-orange-700', score: 2 },
  { value: 'very_bad', emoji: '😢', label: 'Terrible', color: 'bg-red-100 text-red-700', score: 1 },
];

export default function MoodTracker() {
  const { user } = useAuth();
  const [selectedMood, setSelectedMood] = useState<MoodEntry['mood'] | null>(null);
  const [notes, setNotes] = useState('');
  const [history, setHistory] = useState<MoodEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchHistory = useCallback(async () => {
      if (!user) return;
      try {
          const data = await getMoodHistory(user.uid);
          setHistory(data.reverse()); // Reverse for chronological order in chart
      } catch (error) {
          console.error("Failed to load mood history", error);
      } finally {
          setLoading(false);
      }
  }, [user]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const handleSubmit = async () => {
    if (selectedMood && user) {
        try {
            await logMood({
                userId: user.uid,
                mood: selectedMood,
                notes: notes,
                date: new Date()
            });
            alert('Mood logged successfully!');
            setSelectedMood(null);
            setNotes('');
            fetchHistory(); // Refresh
        } catch (error) {
            console.error("Error logging mood", error);
            alert("Failed to save mood");
        }
    }
  };

  const chartData = history.map(entry => {
      const moodConfig = moods.find(m => m.value === entry.mood);
      return {
          date: entry.date.toLocaleDateString(undefined, { weekday: 'short', day: 'numeric' }),
          score: moodConfig?.score || 0,
          mood: entry.mood,
          emoji: moodConfig?.emoji
      };
  });

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-text mb-2">Mood Tracker</h1>
          <p className="text-text-muted">Track how you're feeling and identify patterns</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Mood Entry */}
          <div className="lg:col-span-2 space-y-6">
            <div className="card">
              <h2 className="text-lg font-semibold text-text mb-4">How are you feeling today?</h2>
              
              <div className="flex justify-center gap-3 mb-6">
                {moods.map((mood) => (
                  <button
                    key={mood.value}
                    onClick={() => setSelectedMood(mood.value as MoodEntry['mood'])}
                    className={`flex flex-col items-center p-4 rounded-xl transition-all ${
                      selectedMood === mood.value 
                        ? `${mood.color} ring-2 ring-primary ring-offset-2` 
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    <span className="text-3xl mb-1">{mood.emoji}</span>
                    <span className="text-xs font-medium text-text-muted">{mood.label}</span>
                  </button>
                ))}
              </div>

              {selectedMood && (
                <div className="animate-fade-in">
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Add a note about your day (optional)..."
                    className="input min-h-[100px] resize-none mb-4"
                  />
                  <button 
                    onClick={handleSubmit}
                    className="btn btn-primary w-full"
                  >
                    Save Today's Mood
                  </button>
                </div>
              )}
            </div>

            {/* Chart */}
            <div className="card">
              <h2 className="text-lg font-semibold text-text mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                Mood Trends
              </h2>
              <div className="h-[300px] w-full">
                  {chartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                            <XAxis 
                                dataKey="date" 
                                axisLine={false} 
                                tickLine={false} 
                                tick={{fill: '#6B7280', fontSize: 12}}
                                dy={10}
                            />
                            <YAxis 
                                hide 
                                domain={[0, 6]}
                            />
                            <Tooltip 
                                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                cursor={{ stroke: '#9CA3AF', strokeWidth: 1, strokeDasharray: '4 4' }}
                            />
                            <Line 
                                type="monotone" 
                                dataKey="score" 
                                stroke="#2D6A4F" 
                                strokeWidth={3}
                                dot={{ fill: '#2D6A4F', r: 4, strokeWidth: 2, stroke: '#fff' }}
                                activeDot={{ r: 6, stroke: '#2D6A4F', strokeWidth: 0 }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                  ) : (
                      <div className="h-full flex items-center justify-center text-text-muted">
                          No mood data yet
                      </div>
                  )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Recent History */}
            <div className="card">
              <h2 className="text-lg font-semibold text-text mb-4 flex items-center gap-2">
                 <Calendar className="w-5 h-5 text-primary" />
                 Recent History
              </h2>
              <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
                {loading ? (
                    <p className="text-center text-text-muted">Loading...</p>
                ) : history.length === 0 ? (
                    <p className="text-center text-text-muted">No entries yet</p>
                ) : (
                    history.slice().reverse().map((entry) => {
                        const mood = moods.find(m => m.value === entry.mood);
                        return (
                            <div key={entry.id} className="p-3 bg-gray-50 rounded-lg border border-border">
                                <div className="flex items-center justify-between mb-1">
                                    <span className="text-xs text-text-muted">
                                        {entry.date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                    <span className="text-xl">{mood?.emoji}</span>
                                </div>
                                {entry.notes && (
                                    <p className="text-sm text-text italic">"{entry.notes}"</p>
                                )}
                            </div>
                        );
                    })
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
