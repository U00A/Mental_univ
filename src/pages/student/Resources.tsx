import { useState, useEffect } from 'react';
import { Search, BookOpen, Video, FileText, Headphones, Clock, Sparkles } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { getResources, getMatchingPreferences, type Resource } from '@/lib/firestore';

const categories = [
  { id: 'all', label: 'All' },
  { id: 'anxiety', label: 'Anxiety' },
  { id: 'depression', label: 'Depression' },
  { id: 'stress', label: 'Stress' },
  { id: 'meditation', label: 'Meditation' },
];

const getIcon = (type: string) => {
  switch (type) {
    case 'video': return Video;
    case 'audio': return Headphones;
    default: return FileText;
  }
};

export default function Resources() {
  const { user } = useAuth();
  const [resources, setResources] = useState<Resource[]>([]);
  const [forYouResources, setForYouResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [error, setError] = useState('');
  const [hasPreferences, setHasPreferences] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const data = await getResources(selectedCategory);
        setResources(data);

        if (user) {
          const prefs = await getMatchingPreferences(user.uid);
          if (prefs && prefs.concerns && prefs.concerns.length > 0) {
            setHasPreferences(true);
            // Get all resources and filter for user's concerns
            const allResources = await getResources('all');
            const personalized = allResources.filter(r => 
              prefs.concerns.some(concern => 
                r.category.toLowerCase().includes(concern.toLowerCase()) ||
                r.title.toLowerCase().includes(concern.toLowerCase()) ||
                r.description.toLowerCase().includes(concern.toLowerCase())
              )
            );
            setForYouResources(personalized.slice(0, 3));
          }
        }
      } catch (err) {
        console.error('Error fetching resources:', err);
        setError('Failed to load resources. Please try again later.');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [selectedCategory, user]);

  const filteredResources = resources.filter(r => 
    r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="w-full animate-fade-in">
      
      <main className="w-full">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-text mb-2">Resource Library</h1>
          <p className="text-text-muted">Articles, videos, and guides for your wellness journey</p>
        </div>

        {/* For You Section */}
        {hasPreferences && forYouResources.length > 0 && (
          <div className="mb-10">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-bold text-text">Recommended for You</h2>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {forYouResources.map((resource) => {
                const Icon = getIcon(resource.type);
                return (
                  <div 
                    key={resource.id} 
                    className="bg-linear-to-br from-primary/5 to-primary/10 rounded-[28px] p-5 border border-primary/20 hover:border-primary/40 transition-all group cursor-pointer"
                  >
                    <div className="flex items-center gap-4 mb-3">
                      <div className="w-12 h-12 rounded-xl bg-white shadow-md flex items-center justify-center">
                        <Icon className="w-6 h-6 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-text line-clamp-1 group-hover:text-primary transition-colors">
                          {resource.title}
                        </h3>
                        <span className="text-xs font-bold text-primary-light uppercase tracking-widest">
                          {resource.type}
                        </span>
                      </div>
                    </div>
                    <p className="text-sm text-text-muted line-clamp-2 font-medium">
                      {resource.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Search & Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search resources..."
              className="input pl-10"
            />
          </div>
          
          <div className="flex gap-2 flex-wrap">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${
                  selectedCategory === cat.id 
                    ? 'bg-primary text-white' 
                    : 'bg-white border border-border text-text-muted hover:border-primary'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
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
              <div key={i} className="card card-glass h-[280px] border-none overflow-hidden relative">
                <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/10 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />
                <div className="h-32 rounded-2xl bg-gray-200/50 animate-pulse mb-6" />
                <div className="h-5 w-3/4 bg-gray-200/50 rounded-lg animate-pulse mb-3" />
                <div className="h-3 w-full bg-gray-200/50 rounded-lg animate-pulse mb-2" />
                <div className="h-3 w-5/6 bg-gray-200/50 rounded-lg animate-pulse mt-auto" />
              </div>
            ))}
          </div>
        ) : (
          <div className="animate-fade-in">
            {/* Resources Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredResources.map((resource) => {
                const Icon = getIcon(resource.type);
                return (
                  <div key={resource.id} className="card card-glass card-hover cursor-pointer border-none group overflow-hidden relative">
                    <div className={`h-32 bg-linear-to-br ${resource.color} p-6 flex items-center justify-center relative overflow-hidden group-hover:scale-105 transition-transform duration-500`}>
                      <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                      <div className="w-16 h-16 rounded-3xl bg-white shadow-xl flex items-center justify-center group-hover:rotate-6 transition-transform">
                        <Icon className="w-8 h-8 text-primary" />
                      </div>
                    </div>
                    <h3 className="text-xl font-bold text-text mb-2 group-hover:text-primary transition-colors line-clamp-1">
                      {resource.title}
                    </h3>
                    <p className="text-sm text-text-muted mb-6 line-clamp-2 leading-relaxed font-medium">
                      {resource.description}
                    </p>
                    <div className="flex items-center justify-between mt-auto pt-4 border-t border-border/50">
                      <span className="badge badge-green text-[10px]">{resource.type}</span>
                      <div className="flex items-center gap-1 text-[10px] font-bold text-text-muted uppercase tracking-widest">
                         <Clock className="w-3.5 h-3.5" />
                         {resource.duration} min
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {filteredResources.length === 0 && (
              <div className="text-center py-24 card card-glass border-none">
                <BookOpen className="w-16 h-16 mx-auto text-text-muted/10 mb-6" />
                <h3 className="text-2xl font-bold text-text mb-2">Library is empty</h3>
                <p className="text-text-muted mb-8 max-w-xs mx-auto">We couldn't find any resources in this category yet. Check back later for more content.</p>
                <button 
                  onClick={() => {setSelectedCategory('all'); setSearchQuery('');}}
                  className="btn btn-secondary rounded-xl font-bold"
                >
                  View all items
                </button>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
