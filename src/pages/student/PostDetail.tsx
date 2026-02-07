import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MessageSquare, User, Clock, ArrowLeft, Send, Loader2, AlertTriangle } from 'lucide-react';

import { getPostById, getCommentsByPost, addComment, type Post, type Comment } from '@/lib/firestore';
import { useAuth } from '@/contexts/AuthContext';
import { formatDistanceToNow } from 'date-fns';

export default function PostDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchData() {
      if (!id) return;
      try {
        setLoading(true);
        const postData = await getPostById(id);
        if (postData) {
          setPost(postData);
          const commentData = await getCommentsByPost(id);
          setComments(commentData);
        } else {
          navigate('/community');
        }
      } catch (err) {
        console.error('Error fetching post detail:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [id, navigate]);

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !id || !newComment.trim() || sending) return;

    try {
      setSending(true);
      setError('');
      await addComment({
        postId: id,
        authorId: user.uid,
        authorName: 'Community Member', // Anonymity
        content: newComment.trim()
      });
      
      setNewComment('');
      const updatedComments = await getCommentsByPost(id);
      setComments(updatedComments);
      
      // Update local comment count for UX
      if (post) {
        setPost({ ...post, commentCount: post.commentCount + 1 });
      }
    } catch (err) {
      console.error('Error adding comment:', err);
      setError('Failed to post comment. Please try again.');
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center py-20">
          <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
          <p className="text-xs font-black text-text-muted uppercase tracking-widest animate-pulse">Loading Discussion...</p>
      </div>
    );
  }

  if (!post) return null;

  return (
    <div className="animate-fade-in">
        {/* Navigation Bar */}
        <div className="bg-white border-b border-border sticky top-16 z-30">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center gap-4">
                <button 
                    onClick={() => navigate(-1)}
                    className="p-2 rounded-xl hover:bg-gray-50 text-text-muted transition-colors"
                >
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <span className="text-xs font-black text-text-muted uppercase tracking-widest">Discussion Detail</span>
            </div>
        </div>

        <div className="max-w-2xl mx-auto px-4 py-12">
            {/* Post Content */}
            <article className="bg-white rounded-[40px] p-8 border border-border shadow-xl shadow-primary/5 mb-10">
                <div className="flex items-center gap-4 mb-8">
                    <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-text-muted">
                        <User className="w-6 h-6" />
                    </div>
                    <div>
                        <span className="text-base font-black text-text block">{post.authorName}</span>
                        <div className="flex items-center gap-2 text-xs text-text-muted font-medium uppercase tracking-wider">
                            <Clock className="w-3.5 h-3.5" />
                            {formatDistanceToNow(post.createdAt, { addSuffix: true })}
                        </div>
                    </div>
                </div>

                <h1 className="text-3xl md:text-4xl font-black text-text mb-6 leading-tight">
                    {post.title}
                </h1>
                
                <div className="text-lg text-text-muted leading-relaxed font-medium whitespace-pre-wrap mb-10">
                    {post.content}
                </div>

                <div className="flex items-center gap-4 pt-8 border-t border-gray-50">
                    <div className="flex items-center gap-2 text-sm font-black text-primary bg-primary/5 px-4 py-2 rounded-full">
                        <MessageSquare className="w-4 h-4" />
                        {post.commentCount} Comments
                    </div>
                </div>
            </article>

            {/* Comment Section */}
            <section className="space-y-8">
                <h2 className="text-xl font-black text-text flex items-center gap-3 ml-4">
                    Responses
                    <span className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-[10px] text-text-muted">
                        {comments.length}
                    </span>
                </h2>

                {/* New Comment Input */}
                <div className="bg-white rounded-[32px] p-6 border border-border shadow-lg shadow-gray-200/50">
                    <form onSubmit={handleAddComment} className="relative">
                        <textarea 
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            placeholder="Offer support or share your thoughts..."
                            className="w-full h-32 px-6 py-5 rounded-2xl bg-gray-50 border-none focus:ring-1 focus:ring-primary text-text placeholder:text-text-muted/60 transition-all resize-none font-medium text-sm"
                            required
                        />
                        <div className="flex justify-between items-center mt-4">
                            <span className="text-[10px] font-black text-text-muted uppercase tracking-widest flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gray-50">
                                <User className="w-3 h-3 text-primary" /> Anonymity On
                            </span>
                            <button 
                                type="submit"
                                disabled={sending || !newComment.trim()}
                                className="btn btn-primary px-8 py-2.5 rounded-2xl flex items-center gap-2 shadow-lg shadow-primary/20 disabled:opacity-50"
                            >
                                {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                                Reply
                            </button>
                        </div>
                    </form>
                </div>

                {error && (
                    <div className="p-4 rounded-2xl bg-red-50 border border-red-100 flex items-center gap-3 text-red-600 ml-4">
                        <AlertTriangle className="w-4 h-4" />
                        <p className="text-xs font-bold">{error}</p>
                    </div>
                )}

                {/* Comment Thread */}
                <div className="space-y-6 ml-4 border-l-2 border-gray-100 pl-8 pt-4">
                    {comments.length > 0 ? (
                        comments.map((comment) => (
                            <div key={comment.id} className="relative group">
                                <div className="absolute -left-[34px] top-6 w-3 h-3 rounded-full bg-gray-200 border-4 border-white group-hover:bg-primary transition-colors" />
                                <div className="bg-white rounded-3xl p-6 border border-border hover:border-primary/20 hover:shadow-xl hover:shadow-primary/5 transition-all">
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-text-muted">
                                            <User className="w-4 h-4" />
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className="text-sm font-black text-text">{comment.authorName}</span>
                                            <span className="text-[10px] text-text-muted font-bold uppercase tracking-wider">
                                                {formatDistanceToNow(comment.createdAt, { addSuffix: true })}
                                            </span>
                                        </div>
                                    </div>
                                    <p className="text-sm text-text-muted font-medium leading-relaxed">
                                        {comment.content}
                                    </p>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="py-12 text-center">
                            <p className="text-sm font-bold text-text-muted uppercase tracking-widest opacity-40">No responses yet.</p>
                        </div>
                    )}
                </div>
            </section>
        </div>
    </div>
  );
}
