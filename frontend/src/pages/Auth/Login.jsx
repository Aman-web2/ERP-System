import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { ShieldCheck, Lock, Mail } from 'lucide-react';
import { setCredentials } from '../../store/authSlice';
import api from '../../utils/axiosInstance';

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const submitHandler = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { data } = await api.post('/auth/login', form);
      dispatch(setCredentials(data));
      navigate('/dashboard');
    } catch (requestError) {
      setError(requestError?.response?.data?.message || 'Unable to sign in.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-shell">
      <div className="auth-card space-y-8">
        <div>
          <p className="eyebrow">Enterprise Resource Planning</p>
          <h1 className="mt-3 text-3xl font-semibold text-[var(--text)]">Sign in to the ERP console</h1>
          <p className="mt-2 text-sm text-[var(--muted)]">
            Use the seeded accounts or your own workspace users to access production modules.
          </p>
        </div>

        <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface-muted)] p-4 text-sm text-[var(--muted)]">
          <p className="font-semibold text-[var(--text)]">Demo credentials</p>
          <p className="mt-2">`admin@erp.local / Admin@123`</p>
          <p>`hr@erp.local / Hr@12345`</p>
          <p>`accounts@erp.local / Accounts@123`</p>
        </div>

        <form className="space-y-4" onSubmit={submitHandler}>
          {error ? <div className="badge badge-danger w-full justify-center py-3">{error}</div> : null}
          <div>
            <label className="mb-2 block text-sm font-medium text-[var(--text)]">Email</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--muted)]" size={18} />
              <input
                type="email"
                required
                value={form.email}
                onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
                className="pl-11"
                placeholder="admin@erp.local"
              />
            </div>
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-[var(--text)]">Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--muted)]" size={18} />
              <input
                type="password"
                required
                value={form.password}
                onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
                className="pl-11"
                placeholder="Enter your password"
              />
            </div>
          </div>

          <button type="submit" disabled={loading} className="primary-button w-full">
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        <div className="flex items-center justify-between text-sm text-[var(--muted)]">
          <Link to="/forgot-password" className="text-[var(--primary)]">Reset password</Link>
          <Link to="/register" className="inline-flex items-center gap-2 text-[var(--text)]">
            <ShieldCheck size={16} /> Create user
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;

