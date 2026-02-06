import { useState } from 'react';
import { Smile, X, Clock, Heart, Zap, HandMetal, Utensils, Lightbulb } from 'lucide-react';

interface EmojiPickerProps {
  onEmojiSelect: (emoji: string) => void;
  onClose: () => void;
}

const emojiCategories = {
  recent: { icon: Clock, label: 'Recent', emojis: ['👍', '❤️', '😂', '😮', '😢', '😡', '🙏', '🔥', '🎉', '👏'] },
  smileys: { icon: Smile, label: 'Smileys', emojis: ['😀', '😃', '😄', '😁', '😅', '😂', '🤣', '😊', '😇', '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚', '😋', '😛', '😝', '😜', '🤪', '🤨', '🧐', '🤓', '😎', '🤩', '🥳'] },
  hearts: { icon: Heart, label: 'Hearts', emojis: ['❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '💟', '♥️'] },
  gestures: { icon: HandMetal, label: 'Gestures', emojis: ['👍', '👎', '👏', '🙌', '👐', '🤲', '🤝', '🤜', '🤛', '✊', '👊', '🤞', '✌️', '🤟', '🤘', '👌', '🤏', '👈', '👉', '👆', '👇', '☝️', '✋', '🤚', '🖐️', '🖖', '👋', '🤙', '💪', '🙏'] },
  activities: { icon: Zap, label: 'Activities', emojis: ['⚽', '🏀', '🏈', '⚾', '🥎', '🎾', '🏐', '🏉', '🥏', '🎱', '🏓', '🏸', '🏒', '🏑', '🥍', '🏏', '⛳', '🎯', '🥊', '🥋', '⛸️', '🎣', '🤿', '🎽', '🛹', '🛷', '⛷️', '🏂', '🏋️', '🤼'] },
  objects: { icon: Lightbulb, label: 'Objects', emojis: ['⌚', '📱', '💻', '⌨️', '🖥️', '🖨️', '🖱️', '🖲️', '🕹️', '🗜️', '💽', '💾', '💿', '📀', '📼', '📷', '📸', '📹', '🎥', '📽️', '🎞️', '📞', '☎️', '📟', '📠', '📺', '📻', '🎙️', '🎚️', '🎛️'] },
  food: { icon: Utensils, label: 'Food', emojis: ['🍏', '🍎', '🍐', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🫐', '🍈', '🍒', '🍑', '🍍', '🥝', '🍅', '🥑', '🍆', '🥔', '🥕', '🌽', '🌶️', '🫑', '🥒', '🥬', '🥦', '🧄', '🧅', '🍄', '🥜'] },
  symbols: { icon: Smile, label: 'Symbols', emojis: ['❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💯', '💢', '💥', '💫', '💦', '💨', '🕳️', '💣', '💬', '👁️\u200d🗨️', '🗨️', '🗯️', '💭', '💤'] },
};

export default function EmojiPicker({ onEmojiSelect, onClose }: EmojiPickerProps) {
  const [activeCategory, setActiveCategory] = useState<keyof typeof emojiCategories>('recent');
  
  return (
    <div className="absolute bottom-full left-4 right-4 md:left-auto md:right-8 mb-2 bg-white border border-border rounded-2xl shadow-xl z-50 w-auto md:w-80 animate-in fade-in zoom-in slide-in-from-bottom-4">
      <div className="flex items-center justify-between p-3 border-b border-border">
        <span className="text-xs font-bold text-text-muted uppercase tracking-widest">Select Emoji</span>
        <button onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100 text-text-muted">
          <X className="w-4 h-4" />
        </button>
      </div>
      
      {/* Category tabs */}
      <div className="flex items-center gap-1 p-2 border-b border-border overflow-x-auto">
        {Object.entries(emojiCategories).map(([key, category]) => {
          const Icon = category.icon;
          return (
            <button
              key={key}
              onClick={() => setActiveCategory(key as keyof typeof emojiCategories)}
              className={`p-2 rounded-lg transition-colors shrink-0 ${
                activeCategory === key ? 'bg-primary/10 text-primary' : 'text-text-muted hover:bg-gray-100'
              }`}
              title={category.label}
            >
              <Icon className="w-5 h-5" />
            </button>
          );
        })}
      </div>
      
      {/* Emoji grid */}
      <div className="p-3 h-48 overflow-y-auto">
        <div className="grid grid-cols-8 gap-1">
          {emojiCategories[activeCategory].emojis.map((emoji, index) => (
            <button
              key={`${emoji}-${index}`}
              onClick={() => onEmojiSelect(emoji)}
              className="aspect-square flex items-center justify-center text-xl hover:bg-gray-100 rounded-lg transition-colors"
            >
              {emoji}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
