import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Plus, MessageCircle, Users, ArrowLeft, Loader2 } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import PostCard from '@/components/community/PostCard';
import CreatePostModal from '@/components/community/CreatePostModal';
import { getPostsByCommunity, getCommunities, type Post, type Community } from '@/lib/firestore';

export default function GroupForum() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [community, setCommunity] = useState<Community | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    async function fetchData() {
      if (!id) return;
      try {
        setLoading(true);
        // Fetch community details (using getCommunities for now since we don't have getCommunityById yet)
        const allCommunities = await getCommunities();
        const currentComm = allCommunities.find(c => c.id === id);
        
        if (currentComm) {
          setCommunity(currentComm);
          const communityPosts = await getPostsByCommunity(id);
          setPosts(communityPosts);
        } else {
          navigate('/community');
        }
      } catch (err) {
        console.error('Error fetching group data:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [id, navigate]);

  const handlePostCreated = async () => {
    if (!id) return;
    const communityPosts = await getPostsByCommunity(id);
    setPosts(communityPosts);
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const IconComponent = community ? ((LucideIcons as any)[community.icon] || Users) : Users;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1 pb-24">
        {/* Sub-Header */}
        <div className="bg-white border-b border-border sticky top-16 z-30">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                <div className="flex items-center gap-4">
                    <button 
                        onClick={() => navigate('/community')}
                        className="p-2 rounded-xl hover:bg-gray-50 text-text-muted transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    {community && (
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                                <IconComponent className="w-5 h-5" />
                            </div>
                            <div>
                                <h1 className="text-xl font-black text-text">{community.name}</h1>
                                <div className="flex items-center gap-3 text-[10px] font-bold text-text-muted uppercase tracking-widest">
                                    <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {community.memberCount} members</span>
                                    <span className="w-1 h-1 rounded-full bg-gray-300" />
                                    <span>{community.category}</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>

        {/* Content Feed */}
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
            <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-black text-text">Discussions</h2>
                <button 
                    onClick={() => setIsModalOpen(true)}
                    className="btn btn-primary px-6 py-3 rounded-2xl flex items-center gap-2 shadow-lg shadow-primary/20"
                >
                    <Plus className="w-5 h-5" />
                    New Share
                </button>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-20">
                    <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
                    <p className="text-xs font-bold text-text-muted uppercase tracking-widest animate-pulse">Loading Feed...</p>
                </div>
            ) : posts.length > 0 ? (
                <div className="space-y-6">
                    {posts.map((post) => (
                        <PostCard 
                            key={post.id}
                            post={post}
                            onClick={() => navigate(`/post/${post.id}`)}
                        />
                    ))}
                </div>
            ) : (
                <div className="text-center py-20 bg-gray-50 rounded-[3rem] border-2 border-dashed border-gray-100">
                    <div className="w-16 h-16 rounded-2xl bg-white flex items-center justify-center mx-auto mb-4 shadow-sm">
                        <MessageCircle className="w-8 h-8 text-gray-200" />
                    </div>
                    <p className="text-lg font-black text-text mb-1">No discussions yet</p>
                    <p className="text-sm text-text-muted font-medium mb-8">Be the first to share your thoughts in this community.</p>
                    <button 
                        onClick={() => setIsModalOpen(true)}
                        className="btn bg-white text-primary border border-primary/20 px-8 rounded-full font-bold shadow-sm"
                    >
                        Start a Discussion
                    </button>
                </div>
            )}
        </div>
      </main>

      {community && (
        <CreatePostModal 
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            communityId={community.id}
            communityName={community.name}
            onPostCreated={handlePostCreated}
        />
      )}

      <Footer />
    </div>
  );
}
