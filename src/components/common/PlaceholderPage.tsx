import { useNavigate } from 'react-router-dom';
import { Construction, ArrowLeft } from 'lucide-react';

interface PlaceholderPageProps {
  title: string;
  description?: string;
}

export default function PlaceholderPage({ title, description }: PlaceholderPageProps) {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8 animate-fade-in">
      <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-6 text-primary">
        <Construction className="w-10 h-10" />
      </div>
      <h1 className="text-3xl font-bold text-text mb-4">{title}</h1>
      <p className="text-text-muted max-w-md mb-8">
        {description || "This feature is currently under development. Check back soon for updates!"}
      </p>
      <button 
        onClick={() => navigate(-1)}
        className="btn btn-secondary inline-flex items-center gap-2"
      >
        <ArrowLeft className="w-4 h-4" />
        Go Back
      </button>
    </div>
  );
}
