import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Heart, 
  Search, 
  Star, 
  Calendar, 
  Trash2,
  User,
  ArrowRight,
  Loader2
} from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { useAuth } from '@/contexts/AuthContext';
import { 
  getFavorites, 
  getPsychologistById, 
  removeFavorite,
  type Psychologist,
  type FavoritePsychologist
} from '@/lib/firestore';

interface FavoriteWithDetails extends FavoritePsychologist {
  psychologist?: Psychologist;
}

export default function MyFavorites() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [favorites, setFavorites] = useState<FavoriteWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [removingId, setRemovingId] = useState<string | null>(null);

  const fetchFavorites = useCallback(async () => {
    if (!user) return;
    
    try {
      const favs = await getFavorites(user.uid);
      
      // Fetch psychologist details for each favorite
      const withDetails = await Promise.all(
        favs.map(async (fav) => {
          const psych = await getPsychologistById(fav.psychologistId);
          return { ...fav, psychologist: psych || undefined };
        })
      );
      
      setFavorites(withDetails);
    } catch (error) {
      console.error('Failed to fetch favorites:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchFavorites();
  }, [fetchFavorites]);

  const handleRemove = async (psychologistId: string) => {
    if (!user) return;
    
    setRemovingId(psychologistId);
    try {
      await removeFavorite(user.uid, psychologistId);
      setFavorites(prev => prev.filter(f => f.psychologistId !== psychologistId));
    } catch (error) {
      console.error('Failed to remove favorite:', error);
    } finally {
      setRemovingId(null);
    }
  };

  const filteredFavorites = favorites.filter(f => {
    const psych = f.psychologist;
    if (!psych) return false;
    return (
      psych.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      psych.specializations.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  });

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-text mb-2">My Favorites</h1>
          <p className="text-text-muted">Your saved psychologists and mental health professionals</p>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search favorites..."
              className="input pl-10 w-full"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : favorites.length === 0 ? (
          <div className="card text-center py-16">
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <Heart className="w-10 h-10 text-primary" />
            </div>
            <h3 className="text-xl font-semibold text-text mb-3">No favorites yet</h3>
            <p className="text-text-muted mb-6 max-w-md mx-auto">
              Save psychologists you're interested in to easily find them later and book appointments
            </p>
            <button
              onClick={() => navigate('/student/psychologists')}
              className="btn btn-primary"
            >
              Browse Psychologists
            </button>
          </div>
        ) : filteredFavorites.length === 0 ? (
          <div className="card text-center py-12">
            <p className="text-text-muted">No favorites match your search</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredFavorites.map((favorite) => {
              const psych = favorite.psychologist;
              if (!psych) return null;
              
              return (
                <div key={favorite.id} className="card group hover:shadow-lg transition-shadow">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-14 h-14 rounded-full bg-primary flex items-center justify-center text-white text-xl font-bold">
                        {psych.displayName.charAt(0)}
                      </div>
                      <div>
                        <h3 className="font-semibold text-text">{psych.displayName}</h3>
                        <p className="text-sm text-text-muted">{psych.title}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleRemove(psych.uid)}
                      disabled={removingId === psych.uid}
                      className="p-2 hover:bg-red-50 rounded-lg text-red-500 transition-colors"
                      title="Remove from favorites"
                    >
                      {removingId === psych.uid ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </button>
                  </div>

                  {/* Rating */}
                  <div className="flex items-center gap-2 mb-3">
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < (psych.rating || 0)
                              ? 'text-yellow-400 fill-yellow-400'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-sm text-text-muted">
                      {psych.rating || '0.0'} ({psych.reviewCount || 0} reviews)
                    </span>
                  </div>

                  {/* Specializations */}
                  <div className="flex flex-wrap gap-1 mb-4">
                    {psych.specializations.slice(0, 3).map((spec, i) => (
                      <span
                        key={i}
                        className="px-2 py-1 bg-primary/10 text-primary rounded-full text-xs"
                      >
                        {spec}
                      </span>
                    ))}
                    {psych.specializations.length > 3 && (
                      <span className="px-2 py-1 bg-gray-100 text-text-muted rounded-full text-xs">
                        +{psych.specializations.length - 3}
                      </span>
                    )}
                  </div>

                  {/* Info */}
                  <div className="space-y-2 mb-4 text-sm">
                    <div className="flex items-center gap-2 text-text-muted">
                      <User className="w-4 h-4" />
                      <span>{psych.yearsExperience} years experience</span>
                    </div>
                    <div className="flex items-center gap-2 text-text-muted">
                      <Calendar className="w-4 h-4" />
                      <span>Usually responds in 24h</span>
                    </div>
                  </div>

                  {/* Availability Badge */}
                  <div className="mb-4">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${
                      psych.isAvailable 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${psych.isAvailable ? 'bg-green-500' : 'bg-gray-400'}`} />
                      {psych.isAvailable ? 'Available for booking' : 'Currently unavailable'}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => navigate(`/student/psychologists/${psych.uid}`)}
                      className="btn btn-secondary flex-1 text-sm"
                    >
                      View Profile
                    </button>
                    <button
                      onClick={() => navigate(`/student/book/${psych.uid}`)}
                      disabled={!psych.isAvailable}
                      className="btn btn-primary flex-1 text-sm"
                    >
                      Book Now
                    </button>
                  </div>

                  {/* Saved Date */}
                  <p className="text-xs text-text-muted mt-3 text-center">
                    Saved {favorite.addedAt.toLocaleDateString()}
                  </p>
                </div>
              );
            })}
          </div>
        )}

        {/* Quick Actions */}
        {favorites.length > 0 && (
          <div className="mt-8 card bg-primary/5 border-primary/20">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-text">Looking for more?</h3>
                <p className="text-sm text-text-muted">Browse our full directory of qualified professionals</p>
              </div>
              <button
                onClick={() => navigate('/student/psychologists')}
                className="btn btn-primary flex items-center gap-2"
              >
                Browse All
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
