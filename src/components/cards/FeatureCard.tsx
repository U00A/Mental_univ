import type { LucideIcon } from 'lucide-react';

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  color: string;
}

export default function FeatureCard({ icon: Icon, title, description, color }: FeatureCardProps) {
  return (
    <div className="bg-white rounded-2xl p-6 border border-[#E0E0E0] shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group">
      <div className={`w-12 h-12 rounded-xl ${color} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      <h3 
        className="text-lg font-semibold mb-2 text-[#2C3E50]"
        style={{ fontFamily: 'Outfit, sans-serif' }}
      >
        {title}
      </h3>
      <p className="text-sm text-[#7F8C8D] leading-relaxed">{description}</p>
    </div>
  );
}
