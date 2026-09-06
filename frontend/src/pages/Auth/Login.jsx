import { useState, useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { Lock, Mail, Eye, EyeOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { setCredentials } from '../../store/authSlice';
import api from '../../utils/axiosInstance';

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showDemo, setShowDemo] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', 'light');
  }, []);

  const submitHandler = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { data } = await api.post('/auth/login', form);
      dispatch(setCredentials(data));
      navigate('/dashboard');
    } catch (requestError) {
      setError(requestError?.response?.data?.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f1f5f9] p-6">
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-[440px] bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden"
      >
        <div className="p-8 pb-0">
          <div className="flex items-center gap-2 mb-8">
            <div className="h-10 w-10 rounded-lg bg-primary flex items-center justify-center text-white font-bold text-xl">B</div>
            <h2 className="text-xl font-bold tracking-tight text-slate-900">BizeeERP</h2>
          </div>
          
          <h1 className="text-2xl font-bold text-slate-900">Sign in to your account</h1>
          <p className="mt-2 text-sm text-slate-500 font-medium">Welcome back! Please enter your details.</p>
        </div>

        <form className="p-8 space-y-5" onSubmit={submitHandler}>
          <AnimatePresence mode="wait">
            {error && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-red-50 border border-red-100 text-red-600 text-xs font-semibold p-3 rounded-lg text-center"
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">Email Address</label>
            <div className="relative group">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" size={16} />
              <input
                type="email"
                required
                value={form.email}
                onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
                className="pl-10 h-11 text-sm focus:ring-2 focus:ring-primary/20"
                placeholder="name@company.com"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-700">Password</label>
              <Link to="/forgot-password" size="sm" className="text-xs font-bold text-primary hover:underline">Forgot password?</Link>
            </div>
            <div className="relative group">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" size={16} />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={form.password}
                onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
                className="pl-10 pr-10 h-11 text-sm focus:ring-2 focus:ring-primary/20"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading} 
            className="primary-button w-full h-11 text-sm font-semibold shadow-lg shadow-primary/20"
          >
            {loading ? 'Verifying account...' : 'Sign In'}
          </button>

          <div className="pt-2">
            <button 
              type="button"
              onClick={() => setShowDemo(!showDemo)}
              className="w-full text-xs font-bold text-slate-400 hover:text-slate-600 transition-colors uppercase tracking-wider py-2"
            >
              {showDemo ? 'Hide Quick Access' : 'View Demo Accounts'}
            </button>
            <AnimatePresence>
              {showDemo && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="mt-2 p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2"
                >
                  <div className="flex justify-between items-center bg-white p-2 border border-slate-100 rounded-lg">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Admin</span>
                    <span className="text-[11px] font-bold text-primary cursor-pointer hover:underline" onClick={() => setForm({ email: 'admin@erp.local', password: 'Admin@123' })}>admin@erp.local</span>
                  </div>
                  <div className="flex justify-between items-center bg-white p-2 border border-slate-100 rounded-lg">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">HR</span>
                    <span className="text-[11px] font-bold text-accent cursor-pointer hover:underline" onClick={() => setForm({ email: 'hr@erp.local', password: 'Hr@12345' })}>hr@erp.local</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </form>

        <div className="p-8 pt-0 text-center">
          <p className="text-sm font-medium text-slate-500">
            Don't have an account? <Link to="/register" className="text-primary font-bold hover:underline">Request Access</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
