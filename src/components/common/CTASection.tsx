import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

interface CTASectionProps {
  title: string;
  description: string;
  buttonText: string;
  buttonHref: string;
}

export default function CTASection({ title, description, buttonText, buttonHref }: CTASectionProps) {
  return (
    <section className="py-20 px-8 relative">
      <div className="max-w-4xl mx-auto">
        <div className="bg-gradient-to-br from-[#2D6A4F] to-[#1B4332] text-white p-10 md:p-14 rounded-3xl relative overflow-hidden">
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-2xl" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full blur-2xl" />
          
          <div className="relative text-center">
            <h2 
              className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6"
              style={{ fontFamily: 'Outfit, sans-serif' }}
            >
              {title}
            </h2>
            <p className="text-white/80 mb-8 max-w-xl mx-auto text-base md:text-lg leading-relaxed">
              {description}
            </p>
            <Link 
              to={buttonHref} 
              className="inline-flex items-center gap-3 px-8 py-4 bg-white text-[#2D6A4F] rounded-2xl font-semibold text-lg hover:bg-[#D8F3DC] transition-all duration-300 hover:-translate-y-1 group"
              style={{ fontFamily: 'Outfit, sans-serif' }}
            >
              {buttonText}
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
