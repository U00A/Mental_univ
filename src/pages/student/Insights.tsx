import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart3, Target, Plus, ClipboardCheck, Loader2, Sparkles } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import WellnessChart, { moodToScore } from '@/components/insights/WellnessChart';
import GoalCard from '@/components/insights/GoalCard';
import SymptomCheckerModal from '@/components/insights/SymptomCheckerModal';
import { useAuth } from '@/contexts/AuthContext';
import { getMoodHistory, getTherapyGoals, saveTherapyGoal, updateTherapyGoal, type TherapyGoal, type MoodEntry } from '@/lib/firestore';

export default function Insights() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [moodData, setMoodData] = useState<{ date: Date; score: number }[]>([]);
  const [goals, setGoals] = useState<TherapyGoal[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCheckerOpen, setIsCheckerOpen] = useState(false);

  useEffect(() => {
    async function fetchData() {
      if (!user) return;
      try {
        setLoading(true);

        // Fetch mood history
        const moods = await getMoodHistory(user.uid, 30);
        const chartData = moods.map((m: MoodEntry) => ({
          date: m.date,
          score: moodToScore[m.mood] || 60,
        })).reverse(); // Oldest first for chart

        setMoodData(chartData);

        // Fetch therapy goals
        const userGoals = await getTherapyGoals(user.uid);
        setGoals(userGoals);

      } catch (err) {
        console.error('Error fetching insights data:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [user]);

  const handleMilestoneToggle = async (goalId: string, milestoneIndex: number, completed: boolean) => {
    const goal = goals.find(g => g.id === goalId);
    if (!goal) return;

    const updatedMilestones = [...goal.milestones];
    updatedMilestones[milestoneIndex] = { ...updatedMilestones[milestoneIndex], completed };

    const completedCount = updatedMilestones.filter(m => m.completed).length;
    const newProgress = Math.round((completedCount / updatedMilestones.length) * 100);

    await updateTherapyGoal(goalId, { milestones: updatedMilestones, progress: newProgress });

    setGoals(prev => prev.map(g => 
      g.id === goalId ? { ...g, milestones: updatedMilestones, progress: newProgress } : g
    ));
  };

  const handleAddDemoGoal = async () => {
    if (!user) return;
    await saveTherapyGoal({
      userId: user.uid,
      title: 'Reduce Exam Anxiety',
      description: 'Practice calming techniques before exams.',
      progress: 0,
      milestones: [
        { label: 'Try one breathing exercise', completed: false },
        { label: 'Practice 5-4-3-2-1 grounding', completed: false },
        { label: 'Attend a mindfulness session', completed: false },
      ],
      targetDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 2 weeks
    });
    const updatedGoals = await getTherapyGoals(user.uid);
    setGoals(updatedGoals);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1 pb-24">
        {/* Hero Section */}
        <section className="relative pt-24 pb-16 overflow-hidden">
          <div className="absolute inset-0 bg-primary/5 -skew-y-6 origin-top-right scale-110" />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-6">
                <BarChart3 className="w-4 h-4" />
                <span className="text-xs font-black uppercase tracking-widest">Insights & Analytics</span>
              </div>
              <h1 className="text-5xl md:text-6xl font-black text-text mb-6 leading-[1.1]">
                Your <span className="text-primary italic">Wellness</span> Journey
              </h1>
              <p className="text-xl text-text-muted font-medium leading-relaxed">
                Track your mood trends, set therapy goals, and gain insights into your mental health progress. All data is private and for your eyes only.
              </p>
            </div>
          </div>
        </section>

        {/* Content */}
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-32 space-y-4">
                <Loader2 className="w-12 h-12 text-primary animate-spin" />
                <p className="text-sm font-bold text-text-muted uppercase tracking-widest animate-pulse">
                  Loading Your Insights...
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                {/* Wellness Chart - Takes 2 columns */}
                <div className="lg:col-span-2">
                  {moodData.length > 0 ? (
                    <WellnessChart data={moodData} title="Mood Over Time" />
                  ) : (
                    <div className="bg-white rounded-[32px] p-10 border border-border shadow-xl shadow-primary/5 text-center">
                      <div className="w-16 h-16 rounded-2xl bg-gray-50 flex items-center justify-center mx-auto mb-4">
                        <BarChart3 className="w-8 h-8 text-gray-200" />
                      </div>
                      <h3 className="text-xl font-black text-text mb-2">No Mood Data Yet</h3>
                      <p className="text-text-muted font-medium mb-6">
                        Start logging your daily mood to see trends here.
                      </p>
                      <button
                        onClick={() => navigate('/dashboard')}
                        className="btn bg-gray-100 text-text-muted hover:bg-gray-200 px-8 rounded-full font-bold"
                      >
                        Go to Dashboard
                      </button>
                    </div>
                  )}
                </div>

                {/* Quick Actions Sidebar */}
                <div className="space-y-6">
                  {/* Symptom Checker Card */}
                  <div 
                    onClick={() => setIsCheckerOpen(true)}
                    className="bg-gradient-to-br from-primary to-primary/80 rounded-[32px] p-6 text-white cursor-pointer hover:shadow-2xl hover:shadow-primary/30 transition-all group"
                  >
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <ClipboardCheck className="w-6 h-6" />
                      </div>
                      <h3 className="text-lg font-black">Wellness Check-In</h3>
                    </div>
                    <p className="text-sm font-medium text-white/80">
                      Take a quick self-assessment to track your wellness score.
                    </p>
                  </div>

                  {/* Add Goal Card */}
                  <div 
                    onClick={handleAddDemoGoal}
                    className="bg-white rounded-[32px] p-6 border-2 border-dashed border-gray-200 text-center cursor-pointer hover:border-primary/30 hover:bg-primary/5 transition-all"
                  >
                    <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center mx-auto mb-3">
                      <Plus className="w-6 h-6 text-gray-300" />
                    </div>
                    <p className="text-sm font-bold text-text-muted">Add New Goal</p>
                  </div>
                </div>

                {/* Goals Section - Full Width */}
                <div className="lg:col-span-3 mt-6">
                  <div className="flex items-center justify-between mb-8">
                    <h2 className="text-2xl font-black text-text flex items-center gap-3">
                      <Target className="w-6 h-6 text-primary" />
                      Therapy Goals
                    </h2>
                    {goals.length > 0 && (
                      <span className="text-xs font-bold text-text-muted bg-gray-100 px-3 py-1.5 rounded-full">
                        {goals.filter(g => g.progress >= 100).length} / {goals.length} Completed
                      </span>
                    )}
                  </div>

                  {goals.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {goals.map((goal) => (
                        <GoalCard 
                          key={goal.id}
                          goal={goal}
                          onMilestoneToggle={(index, completed) => handleMilestoneToggle(goal.id, index, completed)}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="bg-white rounded-[32px] p-12 border border-border text-center">
                      <div className="w-16 h-16 rounded-2xl bg-gray-50 flex items-center justify-center mx-auto mb-4">
                        <Target className="w-8 h-8 text-gray-200" />
                      </div>
                      <h3 className="text-xl font-black text-text mb-2">No Goals Set</h3>
                      <p className="text-text-muted font-medium mb-6">
                        Set therapy goals with your psychologist or create your own to track progress.
                      </p>
                      <button
                        onClick={handleAddDemoGoal}
                        className="btn btn-primary px-8 rounded-full flex items-center gap-2 mx-auto"
                      >
                        <Sparkles className="w-4 h-4" />
                        Create Sample Goal
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </section>
      </main>

      <SymptomCheckerModal 
        isOpen={isCheckerOpen}
        onClose={() => setIsCheckerOpen(false)}
      />

      <Footer />
    </div>
  );
}
