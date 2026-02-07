import { Outlet } from 'react-router-dom';
import Header from '@/components/layout/Header';

export default function DashboardLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50/30">
      <Header />
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
