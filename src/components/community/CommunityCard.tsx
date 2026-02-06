import React from 'react';
import { Users, ChevronRight } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { type Community } from '@/lib/firestore';

interface CommunityCardProps {
  community: Community;
  onClick: () => void;
}

const CommunityCard: React.FC<CommunityCardProps> = ({ community, onClick }) => {
  // Dynamically resolve icon from string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const IconComponent = (LucideIcons as any)[community.icon] || Users;

  return (
    <button
      onClick={onClick}
      className="group bg-white rounded-3xl p-6 border border-border hover:border-primary/20 hover:shadow-xl hover:shadow-primary/5 transition-all text-left w-full h-full flex flex-col"
    >
      <div className="flex justify-between items-start mb-4">
        <div className={`w-14 h-14 rounded-2xl bg-primary/5 flex items-center justify-center text-primary group-hover:scale-110 transition-transform duration-500`}>
          <IconComponent className="w-7 h-7" />
        </div>
        <div className="flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-100">
          <Users className="w-3.5 h-3.5 text-text-muted" />
          <span className="text-xs font-bold text-text-muted">{community.memberCount} members</span>
        </div>
      </div>

      <h3 className="text-lg font-black text-text mb-2 group-hover:text-primary transition-colors">{community.name}</h3>
      <p className="text-sm text-text-muted line-clamp-2 mb-6 flex-1">{community.description}</p>

      <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-50">
        <span className="text-[10px] font-black uppercase tracking-widest text-primary/60">{community.category}</span>
        <div className="flex items-center gap-1 text-xs font-bold text-primary opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all">
          Explore Group
          <ChevronRight className="w-4 h-4" />
        </div>
      </div>
    </button>
  );
};

export default CommunityCard;
