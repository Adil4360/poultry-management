import { useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { 
  Home, 
  Egg, 
  Warehouse, 
  Heart, 
  DollarSign, 
  BarChart3, 
  Menu, 
  X,
  Bird,
  Settings,
  LogOut,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { cn } from '../utils/cn';

const navItems = [
  { path: '/', icon: Home, label: 'Dashboard', color: 'from-green-400 to-emerald-500' },
  { path: '/flocks', icon: Bird, label: 'Flocks', color: 'from-blue-400 to-indigo-500' },
  { path: '/eggs', icon: Egg, label: 'Eggs', color: 'from-amber-400 to-orange-500' },
  { path: '/feed', icon: Warehouse, label: 'Feed', color: 'from-purple-400 to-violet-500' },
  { path: '/health', icon: Heart, label: 'Health', color: 'from-rose-400 to-pink-500' },
  { path: '/finance', icon: DollarSign, label: 'Finance', color: 'from-teal-400 to-cyan-500' },
  { path: '/reports', icon: BarChart3, label: 'Reports', color: 'from-indigo-400 to-blue-500' },
  { path: '/settings', icon: Settings, label: 'Settings', color: 'from-gray-400 to-slate-500' },
];

export function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { logout } = useAuth();
  const location = useLocation();

  const handleLogout = () => {
    if (confirm('Are you sure you want to logout?')) {
      logout();
    }
  };

  const currentPage = navItems.find(item => item.path === location.pathname)?.label || 'Dashboard';

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50/50 via-gray-50 to-blue-50/30">
      {/* Mobile Header */}
      <header className="lg:hidden bg-gradient-to-r from-green-600 via-green-700 to-emerald-700 text-white px-4 py-3 flex items-center justify-between sticky top-0 z-50 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
            <Bird className="w-6 h-6" />
          </div>
          <div>
            <span className="font-bold text-sm sm:text-base block leading-tight">Shafqat Poultry</span>
            <span className="text-green-200 text-xs">{currentPage}</span>
          </div>
        </div>
        <button 
          onClick={() => setSidebarOpen(!sidebarOpen)} 
          className="p-2.5 bg-white/10 hover:bg-white/20 rounded-xl transition-all duration-200 min-w-[44px] min-h-[44px] flex items-center justify-center backdrop-blur-sm"
        >
          {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </header>

      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-40 w-72 bg-gradient-to-b from-green-800 via-green-900 to-emerald-900 text-white transform transition-all duration-300 ease-out shadow-2xl",
        "lg:translate-x-0",
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      )}>
        {/* Logo Section */}
        <div className="p-5 hidden lg:block border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-br from-green-400 to-emerald-600 rounded-xl shadow-lg">
              <Bird className="w-8 h-8" />
            </div>
            <div>
              <h1 className="font-bold text-lg">Shafqat Poultry</h1>
              <p className="text-green-300 text-xs font-medium">Layers Management System</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="mt-4 lg:mt-2 px-3 space-y-1 overflow-y-auto max-h-[calc(100vh-280px)]">
          <p className="px-3 py-2 text-xs font-semibold text-green-400 uppercase tracking-wider">Menu</p>
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) => cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group relative",
                "min-h-[48px]",
                isActive 
                  ? 'bg-white/15 text-white shadow-lg backdrop-blur-sm' 
                  : 'text-green-100 hover:bg-white/10 hover:text-white'
              )}
            >
              {({ isActive }) => (
                <>
                  <div className={cn(
                    "p-2 rounded-lg transition-all duration-200",
                    isActive 
                      ? `bg-gradient-to-br ${item.color} shadow-md` 
                      : "bg-white/10 group-hover:bg-white/20"
                  )}>
                    <item.icon className="w-4 h-4" />
                  </div>
                  <span className="flex-1">{item.label}</span>
                  {isActive && (
                    <ChevronRight className="w-4 h-4 text-green-300" />
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Sidebar Footer */}
        <div className="absolute bottom-0 left-0 right-0 bg-black/20 backdrop-blur-sm">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-6 py-3.5 text-sm font-medium text-green-100 hover:bg-red-500/80 hover:text-white transition-all duration-200 group"
          >
            <div className="p-2 bg-white/10 rounded-lg group-hover:bg-white/20 transition-all duration-200">
              <LogOut className="w-4 h-4" />
            </div>
            Logout
          </button>
          <div className="p-4 border-t border-white/10">
            <p className="text-xs text-green-400 font-semibold mb-2">External Partners</p>
            <div className="space-y-1">
              <p className="text-xs text-green-300/80 flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-purple-400 rounded-full"></span>
                Chairman Feed
              </p>
              <p className="text-xs text-green-300/80 flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-blue-400 rounded-full"></span>
                Chairman Hatchery
              </p>
              <p className="text-xs text-green-300/80 flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-amber-400 rounded-full"></span>
                Chairman Group
              </p>
            </div>
          </div>
        </div>
      </aside>

      {/* Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 lg:hidden animate-fade-in"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className="lg:ml-72 min-h-screen">
        <div className="p-4 sm:p-5 lg:p-8 pb-24 lg:pb-8 animate-fade-in">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
