import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Bird, Lock, User, AlertCircle, Egg, Wheat, Shield } from 'lucide-react';

export function Login() {
  const { login, error } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Small delay for UX
    setTimeout(() => {
      login(username, password);
      setIsLoading(false);
    }, 500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-600 via-emerald-700 to-teal-800 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-64 h-64 bg-white/5 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-80 h-80 bg-emerald-300/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/4 opacity-10">
          <Egg className="w-32 h-32 text-white transform -rotate-12" />
        </div>
        <div className="absolute bottom-1/4 right-1/4 opacity-10">
          <Wheat className="w-24 h-24 text-white transform rotate-12" />
        </div>
      </div>
      
      <div className="w-full max-w-md relative z-10">
        {/* Logo Section */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-white rounded-2xl shadow-2xl mb-5 transform hover:scale-105 transition-transform duration-300">
            <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl">
              <Bird className="w-10 h-10 text-white" />
            </div>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
            Shafqat Poultry Farm
          </h1>
          <p className="text-green-200 mt-2 font-medium">Layers Management System</p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-3xl shadow-2xl p-6 sm:p-8 backdrop-blur-xl animate-slide-up">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Welcome Back</h2>
            <p className="text-gray-500 text-sm mt-1">Sign in to manage your farm</p>
          </div>
          
          {error && (
            <div className="mb-5 p-4 bg-red-50 border-2 border-red-100 rounded-xl flex items-center gap-3 text-red-700 animate-fade-in">
              <div className="p-1.5 bg-red-100 rounded-lg">
                <AlertCircle className="w-5 h-5" />
              </div>
              <span className="text-sm font-medium">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Username
              </label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-green-500 transition-colors">
                  <User className="w-5 h-5" />
                </div>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-green-500 focus:ring-4 focus:ring-green-50 transition-all text-base bg-gray-50 focus:bg-white"
                  placeholder="Enter username"
                  required
                  autoComplete="username"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Password
              </label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-green-500 transition-colors">
                  <Lock className="w-5 h-5" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-green-500 focus:ring-4 focus:ring-green-50 transition-all text-base bg-gray-50 focus:bg-white"
                  placeholder="Enter password"
                  required
                  autoComplete="current-password"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2.5 text-base min-h-[56px] shadow-lg shadow-green-200 hover:shadow-xl hover:shadow-green-300 hover:-translate-y-0.5 active:translate-y-0"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Signing In...
                </>
              ) : (
                <>
                  <Shield className="w-5 h-5" />
                  Sign In Securely
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-100">
            <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
              <Shield className="w-4 h-4 text-green-500" />
              <span>Secure farm management access</span>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="grid grid-cols-3 gap-3 mt-6 animate-fade-in">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 text-center">
            <Egg className="w-6 h-6 text-amber-300 mx-auto mb-1" />
            <p className="text-white/80 text-xs">Egg Tracking</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 text-center">
            <Bird className="w-6 h-6 text-blue-300 mx-auto mb-1" />
            <p className="text-white/80 text-xs">Flock Management</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 text-center">
            <Wheat className="w-6 h-6 text-purple-300 mx-auto mb-1" />
            <p className="text-white/80 text-xs">Feed Control</p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-green-200/80 text-sm">
          <p>© 2024 Shafqat Poultry Farm</p>
          <p className="text-green-300/60 text-xs mt-1">Premium Poultry Management</p>
        </div>
      </div>
    </div>
  );
}
