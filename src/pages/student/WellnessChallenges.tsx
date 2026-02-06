import { useState } from 'react';
import { 
  Trophy, 
  Target, 
  Flame, 
  CheckCircle2, 
  Circle, 
  Zap, 
  Calendar,
  Award
} from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

export default function WellnessChallenges() {
  const [completedTasks, setCompletedTasks] = useState<string[]>([]);
  const [showConfetti, setShowConfetti] = useState(false);

  const challenges = [
    {
      id: 'c1',
      title: 'Mindfulness Master',
      icon: Zap,
      color: 'bg-purple-100 text-purple-600',
      description: 'Complete 7 days of 10-minute meditations.',
      progress: 4,
      total: 7,
      reward: '500 XP'
    },
    {
      id: 'c2',
      title: 'Social Butterfly',
      icon: Trophy,
      color: 'bg-yellow-100 text-yellow-600',
      description: 'Post 3 supportive comments in the community.',
      progress: 1,
      total: 3,
      reward: 'Badge'
    },
    {
      id: 'c3',
      title: 'Sleep Specialist',
      icon: Target,
      color: 'bg-blue-100 text-blue-600',
      description: 'Log your sleep for 5 consecutive nights.',
      progress: 5,
      total: 5,
      reward: '300 XP',
      completed: true
    }
  ];

  const dailyTasks = [
    { id: 't1', title: 'Drink 8 glasses of water', xp: 50 },
    { id: 't2', title: 'Take a 15-minute walk', xp: 100 },
    { id: 't3', title: 'Write one journal entry', xp: 75 },
    { id: 't4', title: 'Practice breathing exercise', xp: 50 },
  ];

  const toggleTask = (taskId: string) => {
    if (completedTasks.includes(taskId)) {
      setCompletedTasks(prev => prev.filter(id => id !== taskId));
    } else {
      setCompletedTasks(prev => [...prev, taskId]);
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3000);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background relative overflow-hidden">
      <Header />
      
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-text mb-2">Wellness Challenges</h1>
            <p className="text-text-muted">Build healthy habits and earn rewards.</p>
          </div>
          <div className="flex items-center gap-4 bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center gap-2">
              <Flame className="w-5 h-5 text-orange-500" />
              <span className="font-bold text-text">12 Day Streak</span>
            </div>
            <div className="w-px h-6 bg-gray-200" />
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-yellow-500" />
              <span className="font-bold text-text">Level 5</span>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Challenges Area */}
          <div className="lg:col-span-2 space-y-8">
            {/* Active Challenges */}
            <section>
              <h2 className="text-xl font-bold text-text mb-4 flex items-center gap-2">
                <Target className="w-5 h-5 text-primary" />
                Active Quests
              </h2>
              <div className="grid md:grid-cols-2 gap-4">
                {challenges.map(challenge => (
                  <div key={challenge.id} className="card card-hover group cursor-pointer relative overflow-hidden">
                    {challenge.completed && (
                      <div className="absolute top-0 right-0 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-bl-xl z-10">
                        COMPLETED
                      </div>
                    )}
                    <div className="flex items-start gap-4 mb-4">
                      <div className={`w-12 h-12 rounded-xl ${challenge.color} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                        <challenge.icon className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="font-bold text-text">{challenge.title}</h3>
                        <p className="text-xs text-primary font-bold">{challenge.reward}</p>
                      </div>
                    </div>
                    <p className="text-sm text-text-muted mb-4">{challenge.description}</p>
                    
                    <div className="relative pt-1">
                      <div className="flex mb-2 items-center justify-between">
                        <div className="text-xs font-semibold text-text-muted">
                          {Math.round((challenge.progress / challenge.total) * 100)}%
                        </div>
                        <div className="text-xs font-semibold text-text-muted">
                          {challenge.progress}/{challenge.total}
                        </div>
                      </div>
                      <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-primary/10">
                        <div 
                          style={{ width: `${(challenge.progress / challenge.total) * 100}%` }} 
                          className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center ${challenge.completed ? 'bg-green-500' : 'bg-primary'}`} 
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Daily Tasks */}
            <section>
              <h2 className="text-xl font-bold text-text mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary" />
                Daily Goals
              </h2>
              <div className="card space-y-2">
                {dailyTasks.map(task => {
                  const isCompleted = completedTasks.includes(task.id);
                  return (
                    <button
                      key={task.id}
                      onClick={() => toggleTask(task.id)}
                      className={`w-full flex items-center justify-between p-3 rounded-xl transition-all ${
                        isCompleted 
                          ? 'bg-green-50/50' 
                          : 'hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`transition-colors ${isCompleted ? 'text-green-500' : 'text-gray-300'}`}>
                          {isCompleted ? <CheckCircle2 className="w-6 h-6" /> : <Circle className="w-6 h-6" />}
                        </div>
                        <span className={`font-medium transition-all ${isCompleted ? 'text-text-muted line-through' : 'text-text'}`}>
                          {task.title}
                        </span>
                      </div>
                      <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-1 rounded-lg">
                        +{task.xp} XP
                      </span>
                    </button>
                  );
                })}
              </div>
            </section>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="card bg-gradient-to-br from-primary to-primary-dark text-white text-center py-8">
              <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
                <Award className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-1">Level 5</h3>
              <p className="text-primary-100 text-sm mb-4">Wellness Warrior</p>
              <div className="w-full bg-black/20 rounded-full h-3 mb-2 overflow-hidden">
                <div className="bg-white h-full rounded-full" style={{ width: '65%' }} />
              </div>
              <p className="text-xs text-primary-100">1,250 / 2,000 XP to Level 6</p>
            </div>

            <div className="card">
               <h3 className="font-bold text-text mb-4">Your Badges</h3>
               <div className="grid grid-cols-4 gap-2">
                 {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                   <div key={i} className={`aspect-square rounded-xl flex items-center justify-center ${i <= 3 ? 'bg-amber-100 text-amber-600' : 'bg-gray-100 text-gray-300'}`}>
                     <Award className="w-5 h-5" />
                   </div>
                 ))}
               </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
