import React, { useState } from 'react';
import { X, Send, AlertTriangle, User, Loader2 } from 'lucide-react';
import { createPost } from '@/lib/firestore';
import { useAuth } from '@/contexts/AuthContext';

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  communityId: string;
  communityName: string;
  onPostCreated: () => void;
}

const CreatePostModal: React.FC<CreatePostModalProps> = ({ 
  isOpen, 
  onClose, 
  communityId, 
  communityName, 
  onPostCreated 
}) => {
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !title.trim() || !content.trim()) return;

    try {
      setLoading(true);
      setError('');
      
      await createPost({
        communityId,
        authorId: user.uid,
        authorName: 'Community Member', // Anonymity feature
        title: title.trim(),
        content: content.trim()
      });

      setTitle('');
      setContent('');
      onPostCreated();
      onClose();
    } catch (err) {
      console.error('Error creating post:', err);
      setError('Failed to share your post. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-text/40 backdrop-blur-sm animate-in fade-in duration-300"
        onClick={onClose}
      />
      
      <div className="relative bg-white rounded-[40px] shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-300">
        <div className="p-8">
          <div className="flex justify-between items-start mb-8">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                  <User className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest text-primary/60">Posting as Anonymous Member</span>
              </div>
              <h2 className="text-3xl font-black text-text">Share in {communityName}</h2>
            </div>
            <button 
              onClick={onClose}
              className="p-2 rounded-2xl hover:bg-gray-100 transition-colors"
            >
              <X className="w-6 h-6 text-text-muted" />
            </button>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-100 flex items-center gap-3 text-red-600">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <p className="text-sm font-bold">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-text-muted uppercase tracking-widest ml-4">Subject</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="What's on your mind? (e.g., Struggling with finals...)"
                className="w-full px-6 py-4 rounded-3xl bg-gray-50 border-none focus:ring-1 focus:ring-primary text-text placeholder:text-text-muted/60 transition-all font-bold"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-text-muted uppercase tracking-widest ml-4">Content</label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Share your thoughts, experiences, or request support... This is a safe space."
                className="w-full h-48 px-6 py-4 rounded-3xl bg-gray-50 border-none focus:ring-1 focus:ring-primary text-text placeholder:text-text-muted/60 transition-all resize-none font-medium leading-relaxed"
                required
              />
            </div>

            <div className="bg-primary/5 p-6 rounded-3xl flex items-start gap-3 border border-primary/10 mb-8">
              <AlertTriangle className="w-5 h-5 text-primary shrink-0 mt-0.5" />
              <div className="text-xs text-primary/80 leading-relaxed font-bold">
                Your post will be shared anonymously to protect your privacy and encourage open support. Please follow our community guidelines.
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !title.trim() || !content.trim()}
              className="w-full btn btn-primary py-5 rounded-[2rem] text-lg flex items-center justify-center gap-3 shadow-xl shadow-primary/25 hover:shadow-primary/40 active:scale-[0.98] transition-all disabled:opacity-50 disabled:shadow-none"
            >
              {loading ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  Post Anonymously
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreatePostModal;
