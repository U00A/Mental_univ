import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Star, Clock, Users, Sparkles, Heart } from 'lucide-react';
import MatchingQuizModal from '@/components/matching/MatchingQuizModal';
import FavoriteButton from '@/components/common/FavoriteButton';
import { useAuth } from '@/contexts/AuthContext';
import { 
  getPsychologists, 
  getMatchedPsychologists, 
  getMatchingPreferences, 
  getFavorites,
  type Psychologist, 
  type FavoritePsychologist 
} from '@/lib/firestore';

type FilterTab = 'all' | 'matched' | 'favorites';

export default function Psychologists() {
  const { user } = useAuth();
  const [psychologists, setPsychologists] = useState<Psychologist[]>([]);
  const [matchedPsychologists, setMatchedPsychologists] = useState<Psychologist[]>([]);
  const [favorites, setFavorites] = useState<FavoritePsychologist[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<FilterTab>('all');
  const [isQuizOpen, setIsQuizOpen] = useState(false);
  const [hasPreferences, setHasPreferences] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        setError('');
        const data = await getPsychologists();
        setPsychologists(data);

        if (user) {
          try {
            const prefs = await getMatchingPreferences(user.uid);
            setHasPreferences(!!prefs);

            if (prefs) {
              const matched = await getMatchedPsychologists(user.uid);
              setMatchedPsychologists(matched);
            }
          } catch (prefErr) {
            console.warn('Error fetching preferences:', prefErr);
          }

          try {
            const favs = await getFavorites(user.uid);
            setFavorites(favs);
          } catch (favErr) {
            console.warn('Error fetching favorites:', favErr);
          }
        }
      } catch (err) {
        console.error('Error fetching psychologists:', err);
        // Check for specific Firebase errors
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        if (errorMessage.includes('index')) {
          setError('Database configuration issue. Please contact support.');
        } else if (errorMessage.includes('permission')) {
          setError('Permission denied. Please login again.');
        } else {
          setError('Failed to load psychologists. Please try again later.');
        }
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [user]);

  const handleQuizComplete = (matches: Psychologist[]) => {
    setMatchedPsychologists(matches);
    setHasPreferences(true);
    setActiveTab('matched');
  };

  const getDisplayedPsychologists = () => {
    let list = psychologists;

    if (activeTab === 'matched') {
      list = matchedPsychologists;
    } else if (activeTab === 'favorites') {
      const favIds = favorites.map(f => f.psychologistId);
      list = psychologists.filter(p => favIds.includes(p.uid));
    }

    return list.filter(p =>
      p.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.specializations?.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  };

  const displayedPsychologists = getDisplayedPsychologists();

  return (
    <div className="w-full animate-fade-in">
      
      <main className="w-full">
        {/* Hero Section */}
        <div className="bg-primary/5 rounded-2xl p-8 mb-8 flex flex-col md:flex-row items-center gap-8">
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-text mb-4">Find Your Psychologist</h1>
            <p className="text-text-muted max-w-2xl text-lg mb-6">
              Browse our network of licensed professionals specializing in student mental health. 
              Filter by specialization or let us recommend the best match for you.
            </p>
            <button 
              onClick={() => setIsQuizOpen(true)}
              className="btn btn-primary inline-flex items-center gap-2 shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300"
            >
              <Sparkles className="w-4 h-4" />
              Find Your Match
            </button>
          </div>
          <div className="w-full md:w-1/3 hidden md:block">
            <img 
              src="/images/psychologist_consultation_1770400898494.png" 
              alt="Psychologist Consultation" 
              className="w-full rounded-xl shadow-md rotate-2 hover:rotate-0 transition-transform duration-500"
            />
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-2 mb-6 flex-wrap">
          {(['all', 'matched', 'favorites'] as FilterTab[]).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              disabled={tab === 'matched' && !hasPreferences}
              className={`px-5 py-2.5 rounded-full text-sm font-bold transition-all flex items-center gap-2 ${
                activeTab === tab
                  ? 'bg-primary text-white shadow-md'
                  : 'bg-white border border-gray-100 text-text-muted hover:border-primary/30 hover:text-primary disabled:opacity-30 disabled:cursor-not-allowed'
              }`}
            >
              {tab === 'matched' && <Sparkles className="w-4 h-4" />}
              {tab === 'favorites' && <Heart className="w-4 h-4" />}
              {tab === 'all' && 'All'}
              {tab === 'matched' && 'Matched for You'}
              {tab === 'favorites' && 'Favorites'}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name or specialty..."
            className="input pl-10 max-w-md"
          />
        </div>

        {/* Status Messages */}
        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 flex items-center gap-2 animate-in slide-in-from-top duration-300">
            <span className="font-medium">{error}</span>
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="card card-glass h-[320px] border-none overflow-hidden relative">
                <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/10 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 rounded-2xl bg-gray-200/50 animate-pulse" />
                  <div className="flex-1">
                    <div className="h-5 w-3/4 bg-gray-200/50 rounded-lg animate-pulse mb-2" />
                    <div className="h-3 w-1/2 bg-gray-200/50 rounded-lg animate-pulse" />
                  </div>
                </div>
                <div className="space-y-3 mb-6">
                  <div className="h-3 w-full bg-gray-200/50 rounded-lg animate-pulse" />
                  <div className="h-3 w-5/6 bg-gray-200/50 rounded-lg animate-pulse" />
                </div>
                <div className="flex flex-wrap gap-2 mt-auto">
                   <div className="h-6 w-16 bg-gray-200/50 rounded-full animate-pulse" />
                   <div className="h-6 w-20 bg-gray-200/50 rounded-full animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="animate-fade-in">
            {/* Results */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {displayedPsychologists.map((psych) => (
                <Link 
                  key={psych.uid} 
                  to={`/student/psychologists/${psych.uid}`}
                  className="card card-glass card-hover border-none group flex flex-col relative overflow-hidden"
                >
                  {/* Favorite Button */}
                  <FavoriteButton 
                    psychologistId={psych.uid}
                    size="sm"
                    className="absolute top-4 right-4 z-10 opacity-0 group-hover:opacity-100 transition-opacity"
                  />

                  <div className="flex items-start gap-5 mb-6">
                    <div className="relative shrink-0">
                      {psych.photoURL ? (
                        <img 
                          src={psych.photoURL} 
                          alt={psych.displayName}
                          className="w-16 h-16 rounded-2xl object-cover shadow-md group-hover:scale-110 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-2xl bg-linear-to-br from-primary to-primary-light flex items-center justify-center text-white text-xl font-bold shadow-lg">
                          {psych.displayName.split(' ').map(n => n[0]).join('')}
                        </div>
                      )}
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full shadow-sm"></div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-bold text-text group-hover:text-primary transition-colors truncate">
                        {psych.displayName}
                      </h3>
                      <p className="text-xs font-bold text-primary-light uppercase tracking-widest">{psych.title || 'Psychologist'}</p>
                      <div className="flex items-center gap-1 mt-1.5">
                        <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                        <span className="text-sm font-bold text-text">{psych.rating || 5.0}</span>
                        <span className="text-[10px] font-bold text-text-muted uppercase tracking-tighter">({psych.reviewCount || 0} reviews)</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 mb-6">
                    {psych.specializations?.map((specialty, i) => (
                      <span key={i} className="badge badge-green text-[10px]">
                        {specialty}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center justify-between mt-auto pt-4 border-t border-border/50">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-text-muted uppercase tracking-widest">
                      <Clock className="w-4 h-4" />
                      {psych.yearsExperience || 0} years exp.
                    </div>
                    <div className="btn btn-primary btn-sm rounded-xl py-2 px-4 text-xs">
                      View Profile
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {displayedPsychologists.length === 0 && (
              <div className="text-center py-24 card card-glass border-none">
                <Users className="w-16 h-16 mx-auto text-text-muted/10 mb-6" />
                <h3 className="text-2xl font-bold text-text mb-2">
                  {activeTab === 'matched' ? 'No matches yet' : activeTab === 'favorites' ? 'No favorites yet' : 'No specialists found'}
                </h3>
                <p className="text-text-muted mb-8 max-w-xs mx-auto">
                  {activeTab === 'matched' 
                    ? 'Complete the matching quiz to find psychologists suited for you.'
                    : activeTab === 'favorites'
                    ? 'Tap the heart icon on any psychologist to save them here.'
                    : "We couldn't find anyone matching your current filters. Try searching for something else."}
                </p>
                {activeTab === 'matched' ? (
                  <button 
                    onClick={() => setIsQuizOpen(true)}
                    className="btn btn-primary rounded-xl font-bold"
                  >
                    Take Quiz
                  </button>
                ) : (
                  <button 
                    onClick={() => { setSearchQuery(''); setActiveTab('all'); }}
                    className="btn btn-secondary rounded-xl font-bold"
                  >
                    {activeTab === 'all' ? 'Clear search' : 'Browse All'}
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </main>

      <MatchingQuizModal 
        isOpen={isQuizOpen}
        onClose={() => setIsQuizOpen(false)}
        onComplete={handleQuizComplete}
      />
    </div>
  );
}
