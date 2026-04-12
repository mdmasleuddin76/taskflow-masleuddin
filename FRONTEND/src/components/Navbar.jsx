// src/components/Navbar.jsx
import { Link, useNavigate } from 'react-router-dom';
import { Zap, LogOut, LayoutDashboard, User as UserIcon } from 'lucide-react';
import { useAuth } from '../context/AuthContext'; 

export default function Navbar() {
  const { user, logout } = useAuth(); 
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error("Failed to logout", error);
    }
  };

  return (
    <nav className="fixed top-0 w-full z-50 bg-[#0B1120]/80 backdrop-blur-lg border-b border-slate-800/50 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 sm:h-20">
          
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 sm:gap-2.5 group shrink-0">
            <div className="bg-gradient-to-tr from-cyan-500 to-indigo-500 text-white p-1.5 sm:p-2 rounded-lg sm:rounded-xl group-hover:scale-105 transition-transform shadow-[0_0_15px_rgba(6,182,212,0.4)]">
              <Zap size={18} className="sm:w-5 sm:h-5" fill="currentColor" />
            </div>
            <span className="text-xl sm:text-2xl font-bold text-white tracking-tight">TaskFlow</span>
          </Link>

          {/* Right Side: Dynamic Auth State */}
          <div className="flex items-center gap-3 sm:gap-5 shrink-0">
            {user ? (
              // --- LOGGED IN STATE ---
              <>
                {/* Projects Link - Icon only on mobile, text + icon on desktop */}
                <Link 
                  to="/projects" 
                  className="flex items-center gap-1.5 sm:gap-2 text-sm font-semibold text-slate-300 hover:text-cyan-400 transition-colors"
                >
                  <LayoutDashboard size={18} className="w-5 h-5 sm:w-4 sm:h-4" />
                  <span className="hidden sm:block">Projects</span>
                </Link>
                
                {/* Vertical Divider line */}
                <div className="h-5 sm:h-6 w-px bg-slate-700"></div>
                
                {/* User Pill - Icon only on mobile, Name + Icon on desktop */}
                <div className="flex items-center gap-1 sm:gap-3 bg-slate-800/50 border border-slate-700 pl-1.5 sm:pl-2 pr-1 py-1 rounded-full">
                  <div className="flex items-center gap-1.5 sm:gap-2 pl-1 sm:pl-2">
                    <UserIcon size={14} className="text-slate-400 sm:w-4 sm:h-4" />
                    <span className="hidden sm:block text-xs sm:text-sm font-bold text-slate-200 pr-1 sm:pr-2 truncate max-w-[80px] sm:max-w-none">
                      {user.name || "User"}
                    </span>
                  </div>
                  <button 
                    onClick={handleLogout}
                    className="p-1.5 sm:p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-full transition-all"
                    title="Logout"
                  >
                    <LogOut size={16} className="w-4 h-4 sm:w-4 sm:h-4" />
                  </button>
                </div>
              </>
            ) : (
              // --- LOGGED OUT STATE ---
              <div className="flex items-center gap-3 sm:gap-4">
                <Link 
                  to="/login" 
                  className="text-sm font-bold text-slate-300 hover:text-white transition-colors"
                >
                  Log in
                </Link>
                <Link 
                  to="/signup" 
                  className="text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-indigo-500 to-cyan-500 hover:from-indigo-400 hover:to-cyan-400 transition-all px-4 sm:px-6 py-2 sm:py-2.5 rounded-full shadow-[0_0_10px_rgba(99,102,241,0.3)] hover:shadow-[0_0_20px_rgba(6,182,212,0.5)] active:scale-95 whitespace-nowrap"
                >
                  Sign up free
                </Link>
              </div>
            )}
          </div>
          
        </div>
      </div>
    </nav>
  );
}