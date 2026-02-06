import { Link } from 'react-router-dom';
import { Star, Clock, MessageCircle, Calendar, ChevronRight } from 'lucide-react';
import type { Psychologist } from '@/lib/firestore';
import FavoriteButton from '@/components/common/FavoriteButton';

interface PsychologistCardProps {
  psychologist: Psychologist;
}

export default function PsychologistCard({ psychologist }: PsychologistCardProps) {
  return (
    <Link 
      to={`/psychologist/${psychologist.uid}`} 
      className="bg-white rounded-2xl p-5 border border-[#E0E0E0] shadow-sm group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 relative"
    >
      {/* Favorite Button */}
      <FavoriteButton 
        psychologistId={psychologist.uid} 
        size="sm" 
        className="absolute top-4 right-4 z-10 opacity-0 group-hover:opacity-100 transition-opacity"
      />

      <div className="flex items-start gap-4 mb-4">
        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#2D6A4F] to-[#40916C] flex items-center justify-center text-white text-lg font-bold shrink-0">
          {psychologist.displayName.split(' ').map(n => n[0]).join('')}
        </div>
        <div className="flex-1 min-w-0">
          <h3 
            className="font-semibold text-base group-hover:text-[#2D6A4F] truncate text-[#2C3E50]"
            style={{ fontFamily: 'Outfit, sans-serif' }}
          >
            {psychologist.displayName}
          </h3>
          <p className="text-sm text-[#7F8C8D] truncate">{psychologist.qualifications}</p>
          {psychologist.rating && (
            <div className="flex items-center gap-1 mt-1">
              <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
              <span className="text-sm font-medium text-[#2C3E50]">{psychologist.rating}</span>
              <span className="text-sm text-[#7F8C8D]">({psychologist.reviewCount} reviews)</span>
            </div>
          )}
        </div>
      </div>
      <p className="text-sm text-[#7F8C8D] mb-4 line-clamp-2">{psychologist.bio}</p>
      <div className="flex flex-wrap gap-2 mb-4">
        {psychologist.specializations.slice(0, 3).map(spec => (
          <span key={spec} className="px-3 py-1 text-xs rounded-full bg-[#D8F3DC] text-[#2D6A4F] font-medium">
            {spec}
          </span>
        ))}
      </div>
      <div className="flex items-center justify-between pt-4 border-t border-[#E0E0E0]">
        <div className="flex items-center gap-1 text-sm text-[#7F8C8D]">
          <Clock className="w-4 h-4" />
          {psychologist.yearsExperience} years exp.
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 text-sm text-[#2D6A4F]">
            <MessageCircle className="w-4 h-4" />
            <Calendar className="w-4 h-4" />
          </div>
          <ChevronRight className="w-5 h-5 text-[#7F8C8D] group-hover:translate-x-1 group-hover:text-[#2D6A4F] transition-all" />
        </div>
      </div>
    </Link>
  );
}

