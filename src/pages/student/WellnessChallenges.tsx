import { useState, useEffect } from 'react';
import { 
  Trophy, 
  Target, 
  Flame, 
  Zap, 
  Moon,
  Loader2
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { getChallenges, joinChallenge, type Challenge } from '@/lib/firestore';

export default function WellnessChallenges() {
  const { user } = useAuth();
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [joiningId, setJoiningId] = useState<string | null>(null);

  useEffect(() => {
    async function fetchChallenges() {
      try {
        const data = await getChallenges();
        setChallenges(data);
      } catch (error) {
        console.error('Error fetching challenges:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchChallenges();
  }, []);

  const handleJoin = async (challengeId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) return;
    
    try {
      setJoiningId(challengeId);
      await joinChallenge(challengeId, user.uid);
      
      // Update local state
      setChallenges(prev => prev.map(c => {
        if (c.id === challengeId) {
          return { ...c, participants: [...c.participants, user.uid] };
        }
        return c;
      }));
    } catch (error) {
      console.error('Error joining challenge:', error);
    } finally {
      setJoiningId(null);
    }
  };

  const getChallengeConfig = (type: string) => {
    switch (type) {
      case 'meditation': return { icon: Zap, color: 'bg-purple-100 text-purple-600' };
      case 'exercise': return { icon: Flame, color: 'bg-orange-100 text-orange-600' };
      case 'sleep': return { icon: Moon, color: 'bg-blue-100 text-blue-600' };
      default: return { icon: Trophy, color: 'bg-gray-100 text-gray-600' };
    }
  };

  

  return (
    <div className="w-full relative overflow-hidden animate-fade-in">
      
      <main className="w-full">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-text mb-2">Wellness Challenges</h1>
            <p className="text-text-muted">Build healthy habits and earn rewards.</p>
          </div>
          {/* Placeholder for future gamification stats - currently hidden to avoid fake data */}
          {/* 
          <div className="flex items-center gap-4 bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center gap-2">
              <Flame className="w-5 h-5 text-orange-500" />
              <span className="font-bold text-text">0 Day Streak</span>
            </div>
            <div className="w-px h-6 bg-gray-200" />
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-yellow-500" />
              <span className="font-bold text-text">Level 1</span>
            </div>
          </div>
          */}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Challenges Area */}
          <div className="lg:col-span-3 space-y-8">
            {/* Active Challenges */}
            <section>
              <h2 className="text-xl font-bold text-text mb-4 flex items-center gap-2">
                <Target className="w-5 h-5 text-primary" />
                Active Quests
              </h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {loading ? (
                  <div className="col-span-3 flex justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  </div>
                ) : challenges.length === 0 ? (
                  <div className="col-span-3 text-center py-12 text-text-muted">
                    No active challenges found. Check back later!
                  </div>
                ) : (
                  challenges.map(challenge => {
                    const { icon: Icon, color } = getChallengeConfig(challenge.type);
                    const isJoined = user && challenge.participants.includes(user.uid);
                    const totalDays = Math.ceil((challenge.endDate.getTime() - challenge.startDate.getTime()) / (1000 * 60 * 60 * 24));
                    const progress = isJoined ? 0 : 0; // Placeholder until we have progress tracking

                    return (
                      <div key={challenge.id} className="card card-hover group cursor-pointer relative overflow-hidden">
                        {isJoined && (
                          <div className="absolute top-0 right-0 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-bl-xl z-10">
                            ACTIVE
                          </div>
                        )}
                        <div className="flex items-start gap-4 mb-4">
                          <div className={`w-12 h-12 rounded-xl ${color} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                            <Icon className="w-6 h-6" />
                          </div>
                          <div>
                            <h3 className="font-bold text-text">{challenge.title}</h3>
                            <p className="text-xs text-primary font-bold">100 XP</p>
                          </div>
                        </div>
                        <p className="text-sm text-text-muted mb-4">{challenge.description}</p>
                        
                        {isJoined ? (
                          <div className="relative pt-1">
                            <div className="flex mb-2 items-center justify-between">
                              <div className="text-xs font-semibold text-text-muted">
                                {Math.round((progress / totalDays) * 100)}%
                              </div>
                              <div className="text-xs font-semibold text-text-muted">
                                {progress}/{totalDays} days
                              </div>
                            </div>
                            <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-primary/10">
                              <div 
                                style={{ width: `${(progress / totalDays) * 100}%` }} 
                                className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-primary" 
                              />
                            </div>
                          </div>
                        ) : (
                          <button 
                            onClick={(e) => handleJoin(challenge.id, e)}
                            disabled={joiningId === challenge.id}
                            className="w-full btn btn-primary btn-sm mt-auto"
                          >
                            {joiningId === challenge.id ? (
                              <Loader2 className="w-4 h-4 animate-spin mx-auto" />
                            ) : 'Join Challenge'}
                          </button>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </section>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
             {/* Gamification Sidebar - Hidden until real data is available */}
            {/* 
            <div className="card bg-linear-to-br from-primary to-primary-dark text-white text-center py-8">
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
            */}
          </div>
        </div>
      </main>
    </div>
  );
}
