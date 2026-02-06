import { useState } from 'react';
import { Heart, ThumbsUp, Smile, Frown, Angry, HelpingHand } from 'lucide-react';
import type { ReactionType, MessageReaction } from '@/lib/firestore';

interface MessageReactionsProps {
  reactions: MessageReaction[];
  currentUserId: string;
  onAddReaction: (type: ReactionType) => void;
  onRemoveReaction: () => void;
  isMe: boolean;
}

const reactionConfig: Record<ReactionType, { icon: typeof Heart; color: string; label: string }> = {
  like: { icon: ThumbsUp, color: 'text-blue-500', label: 'Like' },
  love: { icon: Heart, color: 'text-red-500', label: 'Love' },
  care: { icon: HelpingHand, color: 'text-purple-500', label: 'Care' },
  support: { icon: Smile, color: 'text-green-500', label: 'Support' },
  sad: { icon: Frown, color: 'text-yellow-500', label: 'Sad' },
  angry: { icon: Angry, color: 'text-orange-500', label: 'Angry' },
};

export default function MessageReactions({ 
  reactions, 
  currentUserId, 
  onAddReaction, 
  onRemoveReaction,
  isMe 
}: MessageReactionsProps) {
  const [showPicker, setShowPicker] = useState(false);
  
  const myReaction = reactions.find(r => r.userId === currentUserId);
  
  const reactionCounts = reactions.reduce((acc, r) => {
    acc[r.type] = (acc[r.type] || 0) + 1;
    return acc;
  }, {} as Record<ReactionType, number>);
  
  const handleReactionClick = (type: ReactionType) => {
    if (myReaction?.type === type) {
      onRemoveReaction();
    } else {
      onAddReaction(type);
    }
    setShowPicker(false);
  };
  
  return (
    <div className={`flex items-center gap-1 ${isMe ? 'justify-end' : 'justify-start'} mt-1`}>
      {/* Display existing reactions */}
      <div className="flex items-center gap-1 flex-wrap">
        {(Object.keys(reactionCounts) as ReactionType[]).map(type => {
          const config = reactionConfig[type];
          const Icon = config.icon;
          const isMine = myReaction?.type === type;
          
          return (
            <button
              key={type}
              onClick={() => handleReactionClick(type)}
              className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs transition-all ${
                isMine 
                  ? 'bg-primary/20 ring-1 ring-primary' 
                  : 'bg-gray-100 hover:bg-gray-200'
              }`}
              title={config.label}
            >
              <Icon className={`w-3 h-3 ${config.color}`} />
              <span className="font-medium text-text-muted">{reactionCounts[type]}</span>
            </button>
          );
        })}
      </div>
      
      {/* Add reaction button */}
      <div className="relative">
        <button
          onClick={() => setShowPicker(!showPicker)}
          className="p-1 rounded-full hover:bg-gray-100 text-text-muted opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <Smile className="w-4 h-4" />
        </button>
        
        {showPicker && (
          <>
            <div 
              className="fixed inset-0 z-40" 
              onClick={() => setShowPicker(false)}
            />
            <div className="absolute bottom-full left-0 mb-2 p-2 bg-white rounded-xl shadow-lg border border-border z-50 flex gap-1">
              {(Object.keys(reactionConfig) as ReactionType[]).map(type => {
                const config = reactionConfig[type];
                const Icon = config.icon;
                
                return (
                  <button
                    key={type}
                    onClick={() => handleReactionClick(type)}
                    className={`p-2 rounded-lg hover:bg-gray-100 transition-all hover:scale-110 ${
                      myReaction?.type === type ? 'bg-primary/10' : ''
                    }`}
                    title={config.label}
                  >
                    <Icon className={`w-5 h-5 ${config.color}`} />
                  </button>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
