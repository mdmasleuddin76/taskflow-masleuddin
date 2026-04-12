// src/components/Footer.jsx
import { Link } from 'react-router-dom';
import { Zap } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-[#0B1120] border-t border-slate-800/60 py-5 sm:py-6 mt-auto w-full shrink-0">
      <div className="max-w-7xl mx-auto px-4 flex flex-col items-center justify-center space-y-3">
        
        {/* Logo in footer */}
        <div className="flex items-center gap-2 opacity-50">
          <Zap size={18} className="sm:w-4 sm:h-4 text-slate-400" />
          <span className="text-lg font-bold tracking-tight text-slate-400">TaskFlow</span>
        </div>

        {/* Links - Centered */}
        <div className="flex flex-wrap items-center justify-center gap-x-6 sm:gap-x-8 gap-y-2 text-xs sm:text-sm font-semibold text-slate-500">
          <Link to="#" className="hover:text-cyan-400 transition-colors">Privacy Policy</Link>
          <Link to="#" className="hover:text-cyan-400 transition-colors">Terms of Service</Link>
          <Link to="#" className="hover:text-cyan-400 transition-colors">GitHub</Link>
        </div>

        {/* Copyright - Centered */}
        <p className="text-slate-600 text-xs font-medium text-center">
          &copy; {new Date().getFullYear()} TaskFlow Engineering. Built for productivity.
        </p>
      </div>
    </footer>
  );
}