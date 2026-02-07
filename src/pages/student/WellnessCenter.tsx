import { useState, useEffect } from 'react';
import { 
  Moon, 
  Sun, 
  Activity, 
  TrendingUp,
  Plus,
  X,
  Save,
  Loader2
} from 'lucide-react';

import { useAuth } from '@/contexts/AuthContext';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer
} from 'recharts';
import { addSleepEntry, getSleepEntries, type SleepEntry } from '@/lib/firestore';



const qualityConfig: Record<string, { color: string; label: string; score: number }> = {
  poor: { color: 'bg-red-100 text-red-700', label: 'Poor', score: 1 },
  fair: { color: 'bg-yellow-100 text-yellow-700', label: 'Fair', score: 2 },
  good: { color: 'bg-blue-100 text-blue-700', label: 'Good', score: 3 },
  excellent: { color: 'bg-green-100 text-green-700', label: 'Excellent', score: 4 },
};

export default function WellnessCenter() {
  const { user } = useAuth();
  const [sleepEntries, setSleepEntries] = useState<SleepEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddEntry, setShowAddEntry] = useState(false);
  const [selectedDate] = useState(new Date());
  
  // Form state
  const [bedTime, setBedTime] = useState('22:00');
  const [wakeTime, setWakeTime] = useState('07:00');
  const [quality, setQuality] = useState<SleepEntry['quality']>('good');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    async function fetchEntries() {
      if (!user) return;
      try {
        const data = await getSleepEntries(user.uid);
        setSleepEntries(data);
      } catch (error) {
        console.error('Error fetching sleep entries:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchEntries();
  }, [user]);

  const calculateSleepDuration = (bed: string, wake: string) => {
    const [bedHour, bedMin] = bed.split(':').map(Number);
    const [wakeHour, wakeMin] = wake.split(':').map(Number);
    
    let duration = (wakeHour * 60 + wakeMin) - (bedHour * 60 + bedMin);
    if (duration < 0) duration += 24 * 60;
    
    const hours = Math.floor(duration / 60);
    const mins = duration % 60;
    return `${hours}h ${mins}m`;
  };

  const getAverageSleepDuration = () => {
    if (sleepEntries.length === 0) return 0;
    const totalMinutes = sleepEntries.reduce((acc, entry) => {
      const [bedHour, bedMin] = entry.bedTime.split(':').map(Number);
      const [wakeHour, wakeMin] = entry.wakeTime.split(':').map(Number);
      let duration = (wakeHour * 60 + wakeMin) - (bedHour * 60 + bedMin);
      if (duration < 0) duration += 24 * 60;
      return acc + duration;
    }, 0);
    return (totalMinutes / sleepEntries.length / 60).toFixed(1);
  };

  const getAverageQuality = () => {
    if (sleepEntries.length === 0) return 0;
    const total = sleepEntries.reduce((acc, entry) => acc + qualityConfig[entry.quality].score, 0);
    return (total / sleepEntries.length).toFixed(1);
  };

  const handleSave = async () => {
    if (!user) return;
    
    try {
      const newEntryData = {
        userId: user.uid,
        date: selectedDate,
        bedTime,
        wakeTime,
        quality,
        notes
      };
      
      const id = await addSleepEntry(newEntryData);
      
      setSleepEntries(prev => [{
        id,
        ...newEntryData,
        createdAt: new Date()
      } as SleepEntry, ...prev]);
      
      setShowAddEntry(false);
      setNotes('');
    } catch (error) {
      console.error('Error saving sleep entry:', error);
    }
  };

  const chartData = sleepEntries.map(entry => ({
    date: entry.date.toLocaleDateString(undefined, { weekday: 'short' }),
    duration: parseFloat(calculateSleepDuration(entry.bedTime, entry.wakeTime)),
    quality: qualityConfig[entry.quality].score
  }));

  const wellnessTips = [
    { icon: '🌙', title: 'Consistent Schedule', text: 'Try to sleep and wake at the same time every day' },
    { icon: '📱', title: 'Screen-Free Hour', text: 'Avoid screens 1 hour before bedtime' },
    { icon: '☕', title: 'Limit Caffeine', text: 'No caffeine after 2 PM for better sleep' },
    { icon: '🧘', title: 'Relaxation', text: 'Practice meditation or deep breathing before bed' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-text mb-2">Wellness Center</h1>
          <p className="text-text-muted">Track your sleep and wellness metrics</p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="card bg-linear-to-br from-indigo-50 to-indigo-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-500 rounded-full flex items-center justify-center text-white">
                <Moon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-2xl font-bold text-text">{getAverageSleepDuration()}h</p>
                <p className="text-xs text-text-muted">Avg Sleep</p>
              </div>
            </div>
          </div>

          <div className="card bg-linear-to-br from-green-50 to-green-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white">
                <Activity className="w-5 h-5" />
              </div>
              <div>
                <p className="text-2xl font-bold text-text">{getAverageQuality()}/4</p>
                <p className="text-xs text-text-muted">Sleep Quality</p>
              </div>
            </div>
          </div>

          <div className="card bg-linear-to-br from-yellow-50 to-yellow-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-yellow-500 rounded-full flex items-center justify-center text-white">
                <Sun className="w-5 h-5" />
              </div>
              <div>
                <p className="text-2xl font-bold text-text">7</p>
                <p className="text-xs text-text-muted">Day Streak</p>
              </div>
            </div>
          </div>

          <div className="card bg-linear-to-br from-purple-50 to-purple-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center text-white">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div>
                <p className="text-2xl font-bold text-text">+12%</p>
                <p className="text-xs text-text-muted">vs Last Week</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Sleep Chart */}
            <div className="card">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-text flex items-center gap-2">
                  <Moon className="w-5 h-5 text-primary" />
                  Sleep Trends
                </h2>
                <button
                  onClick={() => setShowAddEntry(true)}
                  className="btn btn-primary btn-sm flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Log Sleep
                </button>
              </div>

              {showAddEntry && (
                <div className="mb-6 p-4 bg-gray-50 rounded-xl animate-in fade-in">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-text">Log Sleep Entry</h3>
                    <button onClick={() => setShowAddEntry(false)} className="p-1 hover:bg-gray-200 rounded">
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="text-sm text-text-muted mb-1 block">Bed Time</label>
                      <input
                        type="time"
                        value={bedTime}
                        onChange={(e) => setBedTime(e.target.value)}
                        className="input"
                      />
                    </div>
                    <div>
                      <label className="text-sm text-text-muted mb-1 block">Wake Time</label>
                      <input
                        type="time"
                        value={wakeTime}
                        onChange={(e) => setWakeTime(e.target.value)}
                        className="input"
                      />
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="text-sm text-text-muted mb-2 block">Sleep Quality</label>
                    <div className="flex gap-2">
                      {(Object.keys(qualityConfig) as SleepEntry['quality'][]).map((q) => (
                        <button
                          key={q}
                          onClick={() => setQuality(q)}
                          className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                            quality === q
                              ? qualityConfig[q].color
                              : 'bg-gray-100 text-text-muted hover:bg-gray-200'
                          }`}
                        >
                          {qualityConfig[q].label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="text-sm text-text-muted mb-1 block">Notes (optional)</label>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Any dreams, disturbances, or notes..."
                      rows={2}
                      className="input resize-none"
                    />
                  </div>

                  <button onClick={handleSave} className="btn btn-primary w-full flex items-center justify-center gap-2">
                    <Save className="w-4 h-4" />
                    Save Entry
                  </button>
                </div>
              )}

              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                    <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#6B7280', fontSize: 12}} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#6B7280', fontSize: 12}} />
                    <Tooltip 
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    />
                    <Line type="monotone" dataKey="duration" stroke="#4F46E5" strokeWidth={3} dot={{ fill: '#4F46E5', r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Sleep History */}
            <div className="card">
              <h2 className="text-lg font-semibold text-text mb-4">Recent Sleep History</h2>
              <div className="space-y-3">
                {sleepEntries.slice(-5).reverse().map((entry) => (
                  <div key={entry.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${qualityConfig[entry.quality].color}`}>
                        <Moon className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-medium text-text">
                          {entry.date.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}
                        </p>
                        <p className="text-sm text-text-muted">
                          {entry.bedTime} - {entry.wakeTime}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-text">
                        {calculateSleepDuration(entry.bedTime, entry.wakeTime)}
                      </p>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${qualityConfig[entry.quality].color}`}>
                        {qualityConfig[entry.quality].label}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Wellness Tips */}
            <div className="card">
              <h3 className="font-semibold text-text mb-4 flex items-center gap-2">
                <Sun className="w-5 h-5 text-primary" />
                Sleep Tips
              </h3>
              <div className="space-y-3">
                {wellnessTips.map((tip, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                    <span className="text-2xl">{tip.icon}</span>
                    <div>
                      <p className="font-medium text-text text-sm">{tip.title}</p>
                      <p className="text-xs text-text-muted">{tip.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Weekly Goal */}
            <div className="card bg-linear-to-br from-primary/5 to-purple-50">
              <h3 className="font-semibold text-text mb-3">Weekly Goal</h3>
              <div className="mb-3">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-text-muted">Sleep 8 hours</span>
                  <span className="font-medium text-text">5/7 days</span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-primary rounded-full" style={{ width: '71%' }} />
                </div>
              </div>
              <p className="text-xs text-text-muted">
                You're doing great! Keep maintaining a consistent sleep schedule.
              </p>
            </div>

            {/* Quick Stats */}
            <div className="card">
              <h3 className="font-semibold text-text mb-4">This Week</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-text-muted">Total Sleep</span>
                  <span className="font-medium text-text">52h 30m</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-text-muted">Avg Bedtime</span>
                  <span className="font-medium text-text">10:45 PM</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-text-muted">Avg Wake time</span>
                  <span className="font-medium text-text">6:30 AM</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-text-muted">Best Night</span>
                  <span className="font-medium text-text">Wednesday</span>
                </div>
              </div>
            </div>
          </div>
        </div>
    </div>
  );
}
