import React from 'react';
import { MessageSquare, Clock, User, ArrowUpRight } from 'lucide-react';
import { type Post } from '@/lib/firestore';
import { formatDistanceToNow } from 'date-fns';

interface PostCardProps {
  post: Post;
  onClick: () => void;
}

const PostCard: React.FC<PostCardProps> = ({ post, onClick }) => {
  return (
    <button
      onClick={onClick}
      className="bg-white rounded-3xl p-6 border border-border hover:border-primary/20 hover:shadow-xl hover:shadow-primary/5 transition-all text-left w-full group"
    >
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-text-muted">
            <User className="w-5 h-5" />
          </div>
          <div>
            <span className="text-sm font-bold text-text block">{post.authorName}</span>
            <div className="flex items-center gap-1.5 text-[10px] text-text-muted font-medium uppercase tracking-wider">
              <Clock className="w-3 h-3" />
              {formatDistanceToNow(post.createdAt, { addSuffix: true })}
            </div>
          </div>
        </div>
        <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-text-muted group-hover:bg-primary/10 group-hover:text-primary transition-colors">
          <ArrowUpRight className="w-4 h-4" />
        </div>
      </div>

      <h3 className="text-lg font-black text-text mb-2 group-hover:text-primary transition-colors leading-tight">
        {post.title}
      </h3>
      <p className="text-sm text-text-muted line-clamp-3 mb-6 leading-relaxed">
        {post.content}
      </p>

      <div className="flex items-center gap-4 pt-4 border-t border-gray-50">
        <div className="flex items-center gap-1.5 text-xs font-bold text-primary bg-primary/5 px-3 py-1.5 rounded-full">
          <MessageSquare className="w-3.5 h-3.5" />
          {post.commentCount} {post.commentCount === 1 ? 'comment' : 'comments'}
        </div>
        <div className="text-[10px] font-black uppercase tracking-widest text-text-muted/60">
            Peer Support
        </div>
      </div>
    </button>
  );
};

export default PostCard;
