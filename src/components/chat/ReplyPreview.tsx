import { X, MessageSquare } from 'lucide-react';

interface ReplyPreviewProps {
  content: string;
  senderName: string;
  onCancel: () => void;
}

export default function ReplyPreview({ content, senderName, onCancel }: ReplyPreviewProps) {
  const truncateContent = (text: string, maxLength: number = 60) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };
  
  return (
    <div className="bg-primary/5 border-l-4 border-primary p-3 rounded-r-lg mb-2 animate-in slide-in-from-bottom-2">
      <div className="flex items-start gap-2">
        <MessageSquare className="w-4 h-4 text-primary mt-0.5 shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-primary mb-1">Replying to {senderName}</p>
          <p className="text-sm text-text-muted truncate">{truncateContent(content)}</p>
        </div>
        <button
          onClick={onCancel}
          className="p-1 hover:bg-white rounded-lg transition-colors text-text-muted"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
