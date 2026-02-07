import { ExternalLink } from 'lucide-react';

interface LinkPreviewProps {
  url: string;
  title?: string;
  description?: string;
  image?: string;
  isMe: boolean;
}

export default function LinkPreview({ url, title, description, image, isMe }: LinkPreviewProps) {
  // Extract domain for display
  const getDomain = (urlString: string) => {
    try {
      return new URL(urlString).hostname.replace('www.', '');
    } catch {
      return urlString;
    }
  };

  return (
    <a 
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className={`block mt-2 rounded-lg overflow-hidden border transition-all hover:shadow-md ${
        isMe ? 'border-white/20 bg-white/10' : 'border-gray-200 bg-white'
      }`}
    >
      {image && (
        <div className="w-full h-32 overflow-hidden">
          <img 
            src={image} 
            alt={title || 'Link preview'} 
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        </div>
      )}
      <div className="p-3">
        <div className="flex items-center gap-1 mb-1">
          <ExternalLink className={`w-3 h-3 ${isMe ? 'text-white/60' : 'text-gray-400'}`} />
          <span className={`text-xs ${isMe ? 'text-white/60' : 'text-gray-400'}`}>
            {getDomain(url)}
          </span>
        </div>
        {title && (
          <p className={`font-medium text-sm line-clamp-2 ${isMe ? 'text-white' : 'text-gray-900'}`}>
            {title}
          </p>
        )}
        {description && (
          <p className={`text-xs mt-1 line-clamp-2 ${isMe ? 'text-white/70' : 'text-gray-500'}`}>
            {description}
          </p>
        )}
      </div>
    </a>
  );
}
