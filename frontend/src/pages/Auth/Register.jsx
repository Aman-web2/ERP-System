import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, User, Briefcase, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../utils/axiosInstance';
import { setCredentials } from '../../store/authSlice';

const Register = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'Employee' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const submitHandler = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const { data } = await api.post('/auth/register', form);
      dispatch(setCredentials(data));
      setSuccess('Account created successfully!');
      setTimeout(() => navigate('/dashboard'), 1500);
    } catch (requestError) {
      setError(requestError?.response?.data?.message || 'Unable to create account.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f1f5f9] p-6">
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-[480px] bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden"
      >
        <div className="p-8 pb-0">
          <div className="flex items-center gap-2 mb-8">
            <div className="h-10 w-10 rounded-lg bg-primary flex items-center justify-center text-white font-bold text-xl">B</div>
            <h2 className="text-xl font-bold tracking-tight text-slate-900">BizeeERP</h2>
          </div>
          
          <h1 className="text-2xl font-bold text-slate-900">Create your account</h1>
          <p className="mt-2 text-sm text-slate-500 font-medium">Join our enterprise network and start managing projects.</p>
        </div>

        <form className="p-8 space-y-4" onSubmit={submitHandler}>
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
            {success && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-green-50 border border-green-100 text-green-600 text-xs font-semibold p-3 rounded-lg text-center"
              >
                {success}
              </motion.div>
            )}
          </AnimatePresence>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Full Name</label>
              <div className="relative group">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" size={16} />
                <input
                  required
                  value={form.name}
                  onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                  className="pl-10 h-10 text-sm focus:ring-2 focus:ring-primary/20"
                  placeholder="John Doe"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Role</label>
              <div className="relative group">
                <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors pointer-events-none" size={16} />
                <select 
                  value={form.role} 
                  onChange={(event) => setForm((current) => ({ ...current, role: event.target.value }))}
                  className="pl-10 h-10 text-sm focus:ring-2 focus:ring-primary/20 appearance-none bg-white cursor-pointer"
                >
                  <option value="Employee">Employee</option>
                  <option value="HR">HR</option>
                  <option value="Accountant">Accountant</option>
                  <option value="Admin">Admin</option>
                </select>
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">Email Address</label>
            <div className="relative group">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" size={16} />
              <input
                type="email"
                required
                value={form.email}
                onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
                className="pl-10 h-10 text-sm focus:ring-2 focus:ring-primary/20"
                placeholder="name@company.com"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">Password</label>
            <div className="relative group">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" size={16} />
              <input
                type="password"
                required
                value={form.password}
                onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
                className="pl-10 h-10 text-sm focus:ring-2 focus:ring-primary/20"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading} 
            className="primary-button w-full h-11 text-sm font-semibold shadow-lg shadow-primary/20 mt-2"
          >
            {loading ? 'Creating account...' : (
              <span className="flex items-center justify-center gap-2">
                Create Account <ArrowRight size={16} />
              </span>
            )}
          </button>
        </form>

        <div className="p-8 pt-0 text-center">
          <p className="text-sm font-medium text-slate-500">
            Already have an account? <Link to="/login" className="text-primary font-bold hover:underline">Sign In</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Register;

