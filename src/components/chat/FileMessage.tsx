import { FileText, Download, File } from 'lucide-react';

interface FileMessageProps {
  url: string;
  fileName: string;
  fileSize?: number;
  isMe: boolean;
}

export default function FileMessage({ url, fileName, fileSize, isMe }: FileMessageProps) {
  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };
  
  const getFileIcon = () => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    
    switch (extension) {
      case 'pdf':
        return <FileText className="w-8 h-8 text-red-500" />;
      case 'doc':
      case 'docx':
        return <FileText className="w-8 h-8 text-blue-500" />;
      case 'xls':
      case 'xlsx':
        return <FileText className="w-8 h-8 text-green-500" />;
      default:
        return <File className="w-8 h-8 text-gray-500" />;
    }
  };
  
  const handleDownload = () => {
    window.open(url, '_blank');
  };
  
  return (
    <div 
      onClick={handleDownload}
      className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-colors ${
        isMe 
          ? 'bg-white/10 hover:bg-white/20' 
          : 'bg-gray-100 hover:bg-gray-200'
      }`}
    >
      <div className="shrink-0">
        {getFileIcon()}
      </div>
      
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium truncate ${isMe ? 'text-white' : 'text-text'}`}>
          {fileName}
        </p>
        {fileSize && (
          <p className={`text-xs ${isMe ? 'text-white/70' : 'text-text-muted'}`}>
            {formatFileSize(fileSize)}
          </p>
        )}
      </div>
      
      <Download className={`w-5 h-5 shrink-0 ${isMe ? 'text-white/70' : 'text-text-muted'}`} />
    </div>
  );
}
