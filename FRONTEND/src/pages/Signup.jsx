// src/pages/Signup.jsx
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Lock, CheckCircle, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext'; 
import AuthLayout from '../components/AuthLayout';

// InputField is defined OUTSIDE the main component to prevent focus loss
const InputField = ({ label, icon: Icon, ...props }) => (
  <div className="w-full">
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

export default function Signup() {
  const { user, register } = useAuth(); // Grab user and register from context
  const navigate = useNavigate();

  const [formData, setFormData] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Redirect if user is already logged in
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
    
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setIsLoading(true);
    try {
      // Calls your AuthContext register function to hit the API and log them in instantly
      await register(formData.name, formData.email, formData.password);
      // We don't navigate manually here because the useEffect above handles it 
      // the second the context updates the user state!
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout
      brandingTitle="Get Organized."
      brandingText="Join TaskFlow today to start tracking your projects with speed and clarity."
    >
      <div className="space-y-1 mb-6 text-center lg:text-left">
        <h2 className="text-3xl font-extrabold text-white tracking-tight">Create Account</h2>
        <p className="text-sm text-slate-400">Set up your workspace in seconds.</p>
      </div>
      
      <form className="space-y-4" onSubmit={handleSubmit}>
        {error && (
          <div className="p-3 bg-red-500/10 text-red-400 border border-red-500/20 rounded-xl text-sm font-medium">
            {error}
          </div>
        )}
        
        <InputField 
          label="Full Name" 
          icon={User} 
          name="name"
          type="text" 
          required 
          placeholder="Jane Doe"
          value={formData.name}
          onChange={handleChange}
        />
        
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

        <div className="flex flex-col sm:flex-row gap-4">
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
          <InputField 
            label="Confirm" 
            icon={CheckCircle} 
            name="confirmPassword"
            type="password" 
            required 
            placeholder="••••••••"
            value={formData.confirmPassword}
            onChange={handleChange}
          />
        </div>

        <button 
          type="submit" 
          disabled={isLoading}
          className="w-full mt-2 flex justify-center items-center gap-2 py-3 px-4 rounded-xl font-bold text-white bg-gradient-to-r from-indigo-500 to-cyan-500 hover:from-indigo-400 hover:to-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.3)] transition-all focus:outline-none disabled:opacity-60 active:scale-95"
        >
          {isLoading ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              Creating...
            </>
          ) : 'Sign Up'}
        </button>
      </form>
      
      <p className="text-center text-sm text-slate-400 pt-5">
        Already have an account?{' '}
        <Link to="/login" className="font-bold text-cyan-400 hover:text-cyan-300 transition">
          Sign In
        </Link>
      </p>
    </AuthLayout>
  );
}