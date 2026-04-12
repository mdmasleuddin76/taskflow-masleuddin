// src/components/AuthLayout.jsx
import { Zap } from 'lucide-react';
import Navbar from './Navbar';
import Footer from './Footer';

const AuthLayout = ({ children, brandingTitle, brandingText }) => {
  return (
    <div className="min-h-[100dvh] bg-[#0B1120] flex flex-col font-sans selection:bg-cyan-500/30 selection:text-cyan-100 overflow-x-hidden relative">
      <Navbar />
      
      {/* Background Glows */}
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-[600px] aspect-square bg-indigo-600/10 rounded-full blur-[100px] lg:blur-[120px] pointer-events-none"></div>
      <div className="fixed bottom-0 right-0 w-full max-w-[400px] aspect-square bg-cyan-600/10 rounded-full blur-[80px] lg:blur-[100px] pointer-events-none"></div>

      {/* Main Content Area */}
      <main className="flex-grow flex items-center justify-center w-full px-4 sm:px-6 lg:px-8 pt-24 pb-8 relative z-10">
        
        {/* The Glassmorphism Card */}
        <div className="w-full max-w-5xl flex flex-col lg:flex-row bg-[#121a2f]/80 backdrop-blur-xl border border-slate-800 rounded-3xl lg:rounded-[2rem] shadow-2xl overflow-hidden relative">
          
          {/* Left Side: Branding (Hidden on Mobile) */}
          <div className="hidden lg:flex flex-col justify-center p-12 w-1/2 bg-gradient-to-br from-slate-900/80 to-indigo-900/30 border-r border-slate-800 relative overflow-hidden">
            <div className="relative z-10 space-y-6">
              <div className="inline-flex items-center gap-3 bg-slate-800/50 border border-slate-700 px-4 py-2 rounded-2xl w-fit backdrop-blur-sm">
                <Zap size={24} className="text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]" />
                <span className="text-lg font-bold text-white tracking-tight">TaskFlow</span>
              </div>
              
              <h2 className="text-4xl xl:text-5xl font-extrabold text-white tracking-tight leading-[1.15]">
                {brandingTitle}
              </h2>
              <p className="text-lg text-slate-400 font-medium leading-relaxed">
                {brandingText}
              </p>
            </div>
            
            {/* Decorative pattern */}
            <div className="absolute -bottom-16 -left-16 opacity-10 pointer-events-none">
               <svg width="350" height="350" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
                <path fill="#22d3ee" d="M40.3,-68.1C51.6,-61.1,59.5,-48.5,66.3,-35.4C73.1,-22.4,78.8,-9.1,77.7,3.9C76.6,17,68.7,29.7,59.8,40.7C50.9,51.6,41,60.8,29,66.8C17,72.7,2.9,75.4,-11.1,73.5C-25.1,71.5,-39,64.9,-50.2,55.5C-61.4,46.1,-69.9,33.8,-74.6,20C-79.3,6.2,-80.1,-9.1,-75.4,-23.1C-70.6,-37.1,-60.2,-49.7,-47.3,-56.3C-34.4,-62.8,-17.2,-63.3,-1.2,-61.6C14.7,-59.9,29,-56,40.3,-68.1Z" transform="translate(100 100)" />
              </svg>
            </div>
          </div>

          {/* Right Side: The Form Container */}
          <div className="w-full lg:w-1/2 p-6 sm:p-10 xl:p-12 flex flex-col justify-center">
            {/* Mobile-only Logo */}
            <div className="flex items-center gap-2.5 lg:hidden justify-center mb-8">
              <div className="bg-gradient-to-tr from-cyan-500 to-indigo-500 text-white p-2 rounded-xl shadow-[0_0_15px_rgba(6,182,212,0.4)]">
                <Zap size={20} fill="currentColor" />
              </div>
              <h1 className="text-2xl font-bold text-white tracking-tight">TaskFlow</h1>
            </div>

            {children}
          </div>

        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AuthLayout;