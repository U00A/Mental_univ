import { useState } from 'react';
import { MoreVertical, Edit2, Trash2, Reply, Copy } from 'lucide-react';

interface MessageMenuProps {
  isMe: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
  onReply?: () => void;
  onCopy?: () => void;
  canEdit?: boolean;
}

export default function MessageMenu({ 
  isMe, 
  onEdit, 
  onDelete, 
  onReply, 
  onCopy,
  canEdit = true 
}: MessageMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  
  const handleAction = (action?: () => void) => {
    action?.();
    setIsOpen(false);
  };
  
  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-1 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-gray-100 transition-all"
      >
        <MoreVertical className="w-4 h-4 text-text-muted" />
      </button>
      
      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          <div className={`absolute ${isMe ? 'right-0' : 'left-0'} top-full mt-1 w-40 bg-white rounded-xl shadow-lg border border-border z-50 py-1 animate-in fade-in zoom-in-95`}>
            <button
              onClick={() => handleAction(onReply)}
              className="w-full flex items-center gap-3 px-4 py-2 text-sm text-text hover:bg-gray-50 transition-colors"
            >
              <Reply className="w-4 h-4" />
              Reply
            </button>
            
            <button
              onClick={() => handleAction(onCopy)}
              className="w-full flex items-center gap-3 px-4 py-2 text-sm text-text hover:bg-gray-50 transition-colors"
            >
              <Copy className="w-4 h-4" />
              Copy Text
            </button>
            
            {isMe && canEdit && (
              <>
                <div className="my-1 border-t border-border" />
                <button
                  onClick={() => handleAction(onEdit)}
                  className="w-full flex items-center gap-3 px-4 py-2 text-sm text-text hover:bg-gray-50 transition-colors"
                >
                  <Edit2 className="w-4 h-4" />
                  Edit
                </button>
                
                <button
                  onClick={() => handleAction(onDelete)}
                  className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
}
