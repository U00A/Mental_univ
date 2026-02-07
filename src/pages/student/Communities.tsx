import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, Users, MessageSquare, Loader2, Sparkles } from 'lucide-react';
import CommunityCard from '@/components/community/CommunityCard';
import { getCommunities, seedCommunities, type Community } from '@/lib/firestore';

export default function Communities() {
  const navigate = useNavigate();
  const [communities, setCommunities] = useState<Community[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  useEffect(() => {
    async function fetchCommunities() {
      try {
        await seedCommunities(); // Ensure we have initial groups
        const data = await getCommunities();
        setCommunities(data);
      } catch (err) {
        console.error('Error fetching communities:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchCommunities();
  }, []);

  const categories = ['All', 'Academic', 'Mental Health', 'Lifestyle', 'Peer Support'];

  const filteredCommunities = communities.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          c.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === 'All' || c.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="w-full animate-fade-in">
      
      <main className="w-full">
        {/* Hero Section */}
        <section className="relative pt-12 pb-12 overflow-hidden rounded-3xl bg-primary/5 mb-8">
            <div className="absolute inset-0 bg-primary/5 -skew-y-6 origin-top-right scale-110" />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
                <div className="grid md:grid-cols-2 gap-12 items-center">
                    <div>
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-6">
                            <Users className="w-4 h-4" />
                            <span className="font-medium">Student Communities</span>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-bold text-text mb-6">
                            Find Your People,<br />
                            <span className="text-primary">Share Your Journey</span>
                        </h1>
                        <p className="text-xl text-text-muted mb-8 max-w-lg">
                            Connect with peers who understand what you're going through. 
                            Join safe, moderated spaces for support and growth.
                        </p>
                        
                        <div className="flex flex-col sm:flex-row gap-4 mb-8">
                            <div className="flex-1 relative">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
                                <input 
                                    type="text"
                                    placeholder="Search by topic or interest..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-12 pr-6 py-4 rounded-xl bg-white border border-border focus:ring-2 focus:ring-primary/20 text-text outline-none shadow-sm"
                                />
                            </div>
                            <button className="btn btn-primary px-8 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-primary/20">
                                <Sparkles className="w-5 h-5" />
                                Explore
                            </button>
                        </div>
                    </div>
                    <div className="hidden md:block relative">
                        <div className="absolute -inset-4 bg-primary/10 rounded-full blur-3xl opacity-50" />
                        <img 
                            src="/images/community_support_1770401023924.png" 
                            alt="Community Support" 
                            className="relative w-full rounded-2xl shadow-xl transform rotate-2 hover:rotate-0 transition-transform duration-500" 
                        />
                    </div>
                </div>
            </div>
        </section>

        {/* Categories & Grid */}
        <section className="py-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-wrap items-center gap-3 mb-10">
                    <div className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-gray-100 text-text-muted mr-4">
                        <Filter className="w-4 h-4" />
                        <span className="text-xs font-bold uppercase tracking-widest">Filter By</span>
                    </div>
                    {categories.map((cat) => (
                        <button
                            key={cat}
                            onClick={() => setActiveCategory(cat)}
                            className={`px-6 py-2.5 rounded-2xl text-xs font-bold transition-all ${
                                activeCategory === cat 
                                ? 'bg-primary text-white shadow-lg shadow-primary/25' 
                                : 'bg-white border border-border text-text-muted hover:border-primary/20 hover:bg-primary/5'
                            }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-32 space-y-4">
                        <Loader2 className="w-12 h-12 text-primary animate-spin" />
                        <p className="text-sm font-bold text-text-muted uppercase tracking-widest animate-pulse">Gathering Communities...</p>
                    </div>
                ) : filteredCommunities.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {filteredCommunities.map((community) => (
                            <CommunityCard 
                                key={community.id}
                                community={community}
                                onClick={() => navigate(`/community/${community.id}`)}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="bg-white rounded-[3rem] p-16 text-center border-2 border-dashed border-gray-100 max-w-2xl mx-auto">
                        <div className="w-20 h-20 rounded-3xl bg-gray-50 flex items-center justify-center mx-auto mb-6">
                            <MessageSquare className="w-10 h-10 text-gray-200" />
                        </div>
                        <h3 className="text-2xl font-black text-text mb-2">No communities found</h3>
                        <p className="text-text-muted font-medium mb-8 text-lg">We couldn't find any groups matching your criteria. Try adjusting your search or category.</p>
                        <button 
                            onClick={() => { setSearchQuery(''); setActiveCategory('All'); }}
                            className="btn bg-gray-100 text-text-muted hover:bg-gray-200 px-8 rounded-full font-bold"
                        >
                            Reset Filters
                        </button>
                    </div>
                )}
            </div>
        </section>
      </main>
    </div>
  );
}
