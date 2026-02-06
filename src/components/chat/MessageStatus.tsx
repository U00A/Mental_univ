import { Check, CheckCheck, Loader2 } from 'lucide-react';
import type { MessageStatus } from '@/lib/firestore';

interface MessageStatusProps {
  status: MessageStatus;
  isMe: boolean;
}

export default function MessageStatus({ status, isMe }: MessageStatusProps) {
  if (!isMe) return null;
  
  const statusConfig = {
    sending: { icon: Loader2, className: 'animate-spin text-text-muted', label: 'Sending' },
    sent: { icon: Check, className: 'text-text-muted', label: 'Sent' },
    delivered: { icon: CheckCheck, className: 'text-text-muted', label: 'Delivered' },
    read: { icon: CheckCheck, className: 'text-blue-500', label: 'Read' },
  };
  
  const config = statusConfig[status];
  const Icon = config.icon;
  
  return (
    <span className="flex items-center gap-0.5" title={config.label}>
      <Icon className={`w-3 h-3 ${config.className}`} />
    </span>
  );
}
