import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle2, Layout, Zap } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer'; // Import the new Footer!

export default function Landing() {
  return (
    <div className="min-h-screen bg-[#0B1120] flex flex-col font-sans selection:bg-cyan-500/30 selection:text-cyan-100 overflow-x-hidden w-full">
      <Navbar />
      
      <main className="flex-grow pt-20 sm:pt-24 pb-12 w-full relative">
        {/* Premium Dark Hero Section */}
        <div className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-16 sm:pb-20 lg:pt-24 lg:pb-32 flex flex-col items-center text-center">
          <div className="absolute top-1/4 sm:top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] sm:w-[500px] h-[300px] sm:h-[500px] bg-indigo-600/20 rounded-full blur-[80px] sm:blur-[120px] pointer-events-none"></div>
          <div className="absolute top-0 right-[-10%] sm:right-1/4 w-[80%] sm:w-[300px] h-[250px] sm:h-[300px] bg-cyan-600/10 rounded-full blur-[80px] sm:blur-[100px] pointer-events-none"></div>

          <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-slate-800/80 border border-slate-700 text-cyan-400 text-xs sm:text-sm font-semibold mb-6 sm:mb-8 relative z-10 backdrop-blur-sm">
            <span className="flex h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full bg-cyan-400 shadow-[0_0_8px_#22d3ee]"></span>
            TaskFlow v2.0 is now live
          </div>
          
          <h1 className="text-4xl sm:text-6xl lg:text-8xl font-extrabold text-white tracking-tight leading-[1.1] relative z-10 max-w-5xl px-2">
            Manage your work. <br className="hidden sm:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-500 drop-shadow-sm">
              Deliver on time.
            </span>
          </h1>
          
          <p className="mt-6 sm:mt-8 text-base sm:text-xl lg:text-2xl text-slate-400 font-medium leading-relaxed max-w-3xl relative z-10 px-2 sm:px-0">
            TaskFlow is the minimal, fast, and secure way for engineering teams to plan projects, assign tasks, and ship products without the clutter.
          </p>
          
          <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-5 w-full sm:w-auto relative z-10">
            <Link 
              to="/signup" 
              className="w-full sm:w-auto px-6 sm:px-8 py-3.5 sm:py-4 bg-gradient-to-r from-indigo-500 to-cyan-500 hover:from-indigo-400 hover:to-cyan-400 text-white font-bold rounded-full shadow-[0_0_20px_rgba(6,182,212,0.3)] hover:shadow-[0_0_30px_rgba(6,182,212,0.5)] transition-all flex items-center justify-center gap-2 text-base sm:text-lg active:scale-95"
            >
              Start for free <ArrowRight size={18} className="sm:w-5 sm:h-5" />
            </Link>
            <Link 
              to="/login" 
              className="w-full sm:w-auto px-6 sm:px-8 py-3.5 sm:py-4 bg-slate-800/80 border border-slate-700 hover:bg-slate-800 hover:border-slate-600 text-white font-bold rounded-full transition-all flex items-center justify-center text-base sm:text-lg active:scale-95 backdrop-blur-sm"
            >
              Log into workspace
            </Link>
          </div>
        </div>

        {/* Feature Grid */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 w-full relative z-20">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 lg:gap-10">
            <div className="bg-[#121a2f]/80 backdrop-blur-md p-6 sm:p-8 rounded-3xl shadow-xl border border-slate-800 hover:border-slate-700 hover:-translate-y-1 transition-all duration-300 group">
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-slate-800/80 text-cyan-400 rounded-xl flex items-center justify-center mb-5 border border-slate-700 group-hover:bg-cyan-500/10 transition-colors">
                <Layout size={24} className="sm:w-7 sm:h-7" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-white mb-3">Project Organization</h3>
              <p className="text-sm sm:text-base text-slate-400 font-medium leading-relaxed">Create dedicated workspaces for your initiatives. Group tasks logically and keep your team aligned on the bigger picture.</p>
            </div>

            <div className="bg-[#121a2f]/80 backdrop-blur-md p-6 sm:p-8 rounded-3xl shadow-xl border border-slate-800 hover:border-slate-700 hover:-translate-y-1 transition-all duration-300 group">
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-slate-800/80 text-indigo-400 rounded-xl flex items-center justify-center mb-5 border border-slate-700 group-hover:bg-indigo-500/10 transition-colors">
                <Zap size={24} className="sm:w-7 sm:h-7" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-white mb-3">Lightning Fast</h3>
              <p className="text-sm sm:text-base text-slate-400 font-medium leading-relaxed">Built with modern React and an optimized Go backend. Experience instant updates, drag-and-drop features, and zero lag.</p>
            </div>

            <div className="bg-[#121a2f]/80 backdrop-blur-md p-6 sm:p-8 rounded-3xl shadow-xl border border-slate-800 hover:border-slate-700 hover:-translate-y-1 transition-all duration-300 group">
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-slate-800/80 text-purple-400 rounded-xl flex items-center justify-center mb-5 border border-slate-700 group-hover:bg-purple-500/10 transition-colors">
                <CheckCircle2 size={24} className="sm:w-7 sm:h-7" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-white mb-3">Clear Statuses</h3>
              <p className="text-sm sm:text-base text-slate-400 font-medium leading-relaxed">Know exactly where work stands. Move tasks from To-Do, to In-Progress, to Done with complete visibility.</p>
            </div>
          </div>
        </div>
      </main>

      {/* Render the extracted component here */}
      <Footer />
    </div>
  );
}