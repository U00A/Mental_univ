import { Link } from 'react-router-dom';
import { ChevronRight, type LucideIcon } from 'lucide-react';

interface QuickActionCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  href: string;
  color: 'green' | 'mint' | 'coral' | 'forest';
}

const iconColors = {
  green: 'bg-[#2D6A4F] text-white',
  mint: 'bg-[#40916C] text-white',
  coral: 'bg-[#D84A4A] text-white',
  forest: 'bg-[#1B4332] text-white',
};

export default function QuickActionCard({ icon: Icon, title, description, href, color }: QuickActionCardProps) {
  return (
    <Link 
      to={href} 
      className="bg-white rounded-2xl p-5 border border-[#E0E0E0] shadow-sm flex items-center gap-4 group cursor-pointer hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
    >
      <div className={`w-12 h-12 rounded-xl ${iconColors[color]} flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform`}>
        <Icon className="w-6 h-6" />
      </div>
      <div className="flex-1 min-w-0">
        <h3 
          className="font-semibold text-[#2C3E50] mb-0.5"
          style={{ fontFamily: 'Outfit, sans-serif' }}
        >
          {title}
        </h3>
        <p className="text-sm text-[#7F8C8D] truncate">{description}</p>
      </div>
      <ChevronRight className="w-5 h-5 text-[#7F8C8D] group-hover:translate-x-1 group-hover:text-[#2D6A4F] transition-all shrink-0" />
    </Link>
  );
}
