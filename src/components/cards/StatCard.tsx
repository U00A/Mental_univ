import type { LucideIcon } from 'lucide-react';

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: string;
  trend: string;
  color: 'green' | 'mint' | 'coral' | 'forest';
}

const colors = {
  green: 'bg-[#D8F3DC] text-[#2D6A4F]',
  mint: 'bg-[#95D5B2]/30 text-[#40916C]',
  coral: 'bg-[#FFB4B4]/30 text-[#D84A4A]',
  forest: 'bg-[#1B4332]/10 text-[#1B4332]',
};

export default function StatCard({ icon: Icon, label, value, trend, color }: StatCardProps) {
  return (
    <div className="bg-white rounded-2xl p-5 border border-[#E0E0E0] shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
      <div className={`w-12 h-12 rounded-xl ${colors[color]} flex items-center justify-center mb-4`}>
        <Icon className="w-6 h-6" />
      </div>
      <p className="text-sm text-[#7F8C8D] mb-1">{label}</p>
      <p 
        className="text-2xl md:text-3xl font-bold text-[#2C3E50] mb-1"
        style={{ fontFamily: 'Outfit, sans-serif' }}
      >
        {value}
      </p>
      <p className="text-sm text-[#7F8C8D]">{trend}</p>
    </div>
  );
}
