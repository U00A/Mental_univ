import type { LucideIcon } from 'lucide-react';

interface ResourceCardProps {
  resource: {
    id: string;
    title: string;
    description: string;
    category: string;
    type: string;
    readTime: number;
  };
  TypeIcon: LucideIcon;
}

export default function ResourceCard({ resource, TypeIcon }: ResourceCardProps) {
  return (
    <div className="bg-white rounded-2xl p-5 border border-[#E0E0E0] shadow-sm group cursor-pointer hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
      <div className="h-28 rounded-xl bg-gradient-to-br from-[#D8F3DC] to-[#95D5B2] flex items-center justify-center mb-4">
        <TypeIcon className="w-10 h-10 text-[#2D6A4F]" />
      </div>
      <h3 
        className="font-semibold mb-2 text-[#2C3E50] group-hover:text-[#2D6A4F] transition-colors line-clamp-2"
        style={{ fontFamily: 'Outfit, sans-serif' }}
      >
        {resource.title}
      </h3>
      <p className="text-sm text-[#7F8C8D] line-clamp-2 mb-4">{resource.description}</p>
      <div className="flex items-center justify-between pt-4 border-t border-[#E0E0E0]">
        <span className="text-sm text-[#2D6A4F] font-medium capitalize">{resource.type}</span>
        <span className="text-xs text-[#7F8C8D]">{resource.readTime} min</span>
      </div>
    </div>
  );
}
