// src/pages/Login.jsx
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Loader2, LogIn } from 'lucide-react';
import { useAuth } from '../context/AuthContext'; // IMPORTED THIS BACK
import AuthLayout from '../components/AuthLayout';

const InputField = ({ label, icon: Icon, ...props }) => (
  <div>
    <label className="block text-xs font-bold text-slate-400 mb-1.5 tracking-wider uppercase">{label}</label>
    <div className="relative">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
        <Icon size={16} />
      </div>
      <input 
        {...props}
        className="block w-full border border-slate-700 bg-[#0B1120] text-white rounded-xl px-3 pl-10 py-2.5 text-sm transition focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 placeholder-slate-600 outline-none" 
      />
    </div>
  </div>
);

export default function Login() {
  const { user, login } = useAuth(); // GET USER AND LOGIN FUNCTION
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // --- THE FIX: Redirect if already logged in ---
  useEffect(() => {
    if (user) {
      navigate('/projects', { replace: true });
    }
  }, [user, navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    try {
      // Actually calling your AuthContext login function now
      await login(formData.email, formData.password); 
      navigate('/projects'); 
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid email or password.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout
      brandingTitle="Welcome back."
      brandingText="Log in to manage your projects and keep your team aligned."
    >
      <div className="space-y-1 mb-8 text-center lg:text-left">
        <h2 className="text-3xl font-extrabold text-white tracking-tight">Sign In</h2>
        <p className="text-sm text-slate-400">Access your workspace and tasks.</p>
      </div>
      
      <form className="space-y-4" onSubmit={handleSubmit}>
        {error && <div className="p-3 bg-red-500/10 text-red-400 border border-red-500/20 rounded-xl text-sm font-medium">{error}</div>}
        
        <InputField 
          label="Email Address" 
          icon={Mail} 
          name="email"
          type="email" 
          required 
          placeholder="you@example.com"
          value={formData.email}
          onChange={handleChange}
        />

        <InputField 
          label="Password" 
          icon={Lock} 
          name="password"
          type="password" 
          required 
          placeholder="••••••••"
          value={formData.password}
          onChange={handleChange}
        />

        <div className="flex items-center justify-end pt-1 pb-2">
          <Link to="#" className="text-sm font-medium text-cyan-400 hover:text-cyan-300 transition">
            Forgot password?
          </Link>
        </div>

        <button 
          type="submit" 
          disabled={isLoading}
          className="w-full flex justify-center items-center gap-2 py-3 px-4 rounded-xl font-bold text-white bg-gradient-to-r from-indigo-500 to-cyan-500 hover:from-indigo-400 hover:to-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.3)] transition-all focus:outline-none disabled:opacity-60 active:scale-95"
        >
          {isLoading ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              Signing in...
            </>
          ) : (
            <>
              Sign In <LogIn size={18} />
            </>
          )}
        </button>
      </form>
      
      <p className="text-center text-sm text-slate-400 pt-6">
        Don't have an account?{' '}
        <Link to="/signup" className="font-bold text-cyan-400 hover:text-cyan-300 transition">
          Create one now
        </Link>
      </p>
    </AuthLayout>
  );
}