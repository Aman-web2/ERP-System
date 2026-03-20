import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { setCredentials } from '../../store/authSlice';
import api from '../../utils/axiosInstance';

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
      setSuccess('User created successfully. Redirecting to dashboard...');
      setTimeout(() => navigate('/dashboard'), 900);
    } catch (requestError) {
      setError(requestError?.response?.data?.message || 'Unable to create user.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-shell">
      <div className="auth-card space-y-8">
        <div>
          <p className="eyebrow">Bootstrap Access</p>
          <h1 className="mt-3 text-3xl font-semibold text-[var(--text)]">Create an ERP user</h1>
          <p className="mt-2 text-sm text-[var(--muted)]">
            Public registration creates an Employee account after bootstrap. Admin or HR should create privileged users from the HR module.
          </p>
        </div>

        <form className="space-y-4" onSubmit={submitHandler}>
          {error ? <div className="badge badge-danger w-full justify-center py-3">{error}</div> : null}
          {success ? <div className="badge badge-success w-full justify-center py-3">{success}</div> : null}

          <div>
            <label className="mb-2 block text-sm font-medium text-[var(--text)]">Full name</label>
            <input
              required
              value={form.name}
              onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
              placeholder="Aarav Nair"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-[var(--text)]">Email</label>
            <input
              type="email"
              required
              value={form.email}
              onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
              placeholder="employee@erp.local"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-[var(--text)]">Password</label>
            <input
              type="password"
              required
              value={form.password}
              onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
              placeholder="Minimum 6 characters"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-[var(--text)]">Requested role</label>
            <select value={form.role} onChange={(event) => setForm((current) => ({ ...current, role: event.target.value }))}>
              <option value="Employee">Employee</option>
              <option value="HR">HR</option>
              <option value="Accountant">Accountant</option>
              <option value="Admin">Admin</option>
            </select>
          </div>

          <button type="submit" disabled={loading} className="primary-button w-full">
            {loading ? 'Creating account...' : 'Create account'}
          </button>
        </form>

        <p className="text-sm text-[var(--muted)]">
          Already have access? <Link to="/login" className="text-[var(--primary)]">Sign in</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;

