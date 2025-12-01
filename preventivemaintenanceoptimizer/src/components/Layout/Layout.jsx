import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import useStore from '../../store/useStore';

export default function Layout() {
  const { sidebarOpen } = useStore();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Sidebar />
      <Header />
      <main
        className={`
          pt-16 min-h-screen transition-all duration-300
          ${sidebarOpen ? 'ml-64' : 'ml-[72px]'}
        `}
      >
        <div className="p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
