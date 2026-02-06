import { useEffect, useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import type { UserPresence } from '@/lib/firestore';

interface OnlineStatusProps {
  presence: UserPresence | null;
}

export default function OnlineStatus({ presence }: OnlineStatusProps) {
  const [displayText, setDisplayText] = useState('Offline');
  
  useEffect(() => {
    if (!presence) {
      setDisplayText('Offline');
      return;
    }
    
    if (presence.isOnline) {
      setDisplayText('Active now');
    } else if (presence.lastSeen) {
      const timeAgo = formatDistanceToNow(presence.lastSeen, { addSuffix: true });
      setDisplayText(`Last seen ${timeAgo}`);
    } else {
      setDisplayText('Offline');
    }
  }, [presence]);
  
  return (
    <div className="flex items-center gap-2">
      {presence?.isOnline ? (
        <>
          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <span className="text-xs text-green-600 font-medium">{displayText}</span>
        </>
      ) : (
        <span className="text-xs text-text-muted">{displayText}</span>
      )}
    </div>
  );
}
