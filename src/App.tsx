import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { Flocks } from './pages/Flocks';
import { Eggs } from './pages/Eggs';
import { Feed } from './pages/Feed';
import { Health } from './pages/Health';
import { Finance } from './pages/Finance';
import { Reports } from './pages/Reports';
import { Settings } from './pages/Settings';
import { Login } from './pages/Login';
import { useApp } from './context/AppContext';
import { Bird } from 'lucide-react';

function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-600 via-emerald-700 to-teal-800 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-64 h-64 bg-white/5 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-80 h-80 bg-emerald-300/10 rounded-full blur-3xl" />
      </div>
      
      <div className="text-center relative z-10">
        <div className="inline-flex items-center justify-center w-24 h-24 bg-white rounded-2xl shadow-2xl mb-6">
          <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl animate-pulse">
            <Bird className="w-10 h-10 text-white" />
          </div>
        </div>
        <h1 className="text-3xl font-bold text-white mb-2">Shafqat Poultry Farm</h1>
        <p className="text-green-200 mb-6">Loading your farm data...</p>
        <div className="flex items-center justify-center gap-2">
          <div className="w-2 h-2 bg-green-300 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
          <div className="w-2 h-2 bg-green-300 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
          <div className="w-2 h-2 bg-green-300 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    </div>
  );
}

function AppRoutes() {
  const { loading } = useApp();

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Dashboard />} />
        <Route path="flocks" element={<Flocks />} />
        <Route path="eggs" element={<Eggs />} />
        <Route path="feed" element={<Feed />} />
        <Route path="health" element={<Health />} />
        <Route path="finance" element={<Finance />} />
        <Route path="reports" element={<Reports />} />
        <Route path="settings" element={<Settings />} />
      </Route>
    </Routes>
  );
}

function AuthenticatedApp() {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Login />;
  }

  return (
    <AppProvider>
      <AppRoutes />
    </AppProvider>
  );
}

export function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AuthenticatedApp />
      </AuthProvider>
    </BrowserRouter>
  );
}
