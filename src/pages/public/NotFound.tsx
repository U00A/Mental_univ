import { useNavigate } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 text-center">
      <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mb-6">
        <span className="text-4xl font-bold text-primary">404</span>
      </div>
      
      <h1 className="text-3xl font-bold text-text mb-2">Page Not Found</h1>
      <p className="text-text-muted max-w-md mb-8">
        Oops! The page you're looking for doesn't exist or has been moved. 
        Let's get you back on track.
      </p>

      <div className="flex flex-col sm:flex-row gap-4">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 px-6 py-2.5 bg-white border border-gray-200 text-text font-medium rounded-xl hover:bg-gray-50 transition-colors shadow-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          Go Back
        </button>
        
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white font-medium rounded-xl hover:bg-primary-dark transition-colors shadow-lg shadow-primary/20"
        >
          <Home className="w-4 h-4" />
          Home Page
        </button>
      </div>
    </div>
  );
}
