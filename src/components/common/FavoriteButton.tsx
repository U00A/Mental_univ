import { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { addFavorite, removeFavorite, isFavorite } from '@/lib/firestore';

interface FavoriteButtonProps {
  psychologistId: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export default function FavoriteButton({ psychologistId, size = 'md', className = '' }: FavoriteButtonProps) {
  const { user } = useAuth();
  const [isFav, setIsFav] = useState(false);
  const [loading, setLoading] = useState(false);

  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
  };

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  useEffect(() => {
    async function checkFavorite() {
      if (user) {
        const result = await isFavorite(user.uid, psychologistId);
        setIsFav(result);
      }
    }
    checkFavorite();
  }, [user, psychologistId]);

  const handleToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user || loading) return;

    setLoading(true);
    try {
      if (isFav) {
        await removeFavorite(user.uid, psychologistId);
        setIsFav(false);
      } else {
        await addFavorite(user.uid, psychologistId);
        setIsFav(true);
      }
    } catch (err) {
      console.error('Error toggling favorite:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      className={`${sizeClasses[size]} rounded-full flex items-center justify-center transition-all ${
        isFav
          ? 'bg-red-50 text-red-500 hover:bg-red-100'
          : 'bg-gray-50 text-gray-300 hover:bg-gray-100 hover:text-gray-400'
      } ${className}`}
      aria-label={isFav ? 'Remove from favorites' : 'Add to favorites'}
    >
      <Heart
        className={`${iconSizes[size]} transition-transform ${isFav ? 'fill-current scale-110' : ''}`}
      />
    </button>
  );
}
