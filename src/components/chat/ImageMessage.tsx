import { useState } from 'react';
import { X, Download, Loader2 } from 'lucide-react';

interface ImageMessageProps {
  url: string;
  fileName?: string;
  isMe: boolean;
}

export default function ImageMessage({ url, fileName, isMe }: ImageMessageProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  const handleDownload = async () => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = fileName || 'image.jpg';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
    } catch (err) {
      console.error('Failed to download image:', err);
    }
  };
  
  return (
    <>
      <div className={`relative rounded-xl overflow-hidden ${isMe ? 'bg-white/10' : 'bg-gray-100'}`}>
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        )}
        <img
          src={url}
          alt="Shared image"
          className="max-w-[250px] max-h-[200px] object-cover cursor-pointer hover:opacity-90 transition-opacity"
          onClick={() => setIsOpen(true)}
          onLoad={() => setIsLoading(false)}
        />
      </div>
      
      {isOpen && (
        <div 
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setIsOpen(false)}
        >
          <button
            onClick={() => setIsOpen(false)}
            className="absolute top-4 right-4 p-2 text-white hover:bg-white/10 rounded-full transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
          
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDownload();
            }}
            className="absolute top-4 right-16 p-2 text-white hover:bg-white/10 rounded-full transition-colors"
          >
            <Download className="w-6 h-6" />
          </button>
          
          <img
            src={url}
            alt="Shared image"
            className="max-w-full max-h-[90vh] object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </>
  );
}
