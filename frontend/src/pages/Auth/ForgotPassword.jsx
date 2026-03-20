import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../utils/axiosInstance';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const requestOtp = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { data } = await api.post('/auth/forgotpassword', { email });
      setMessage(data.otp ? `OTP generated: ${data.otp}` : data.message);
      setStep(2);
    } catch (requestError) {
      setError(requestError?.response?.data?.message || 'Unable to send OTP.');
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');

    try {
      await api.post('/auth/resetpassword', { email, otp, newPassword });
      setMessage('Password updated successfully. Redirecting to login...');
      setTimeout(() => navigate('/login'), 1000);
    } catch (requestError) {
      setError(requestError?.response?.data?.message || 'Unable to reset password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-shell">
      <div className="auth-card space-y-8">
        <div>
          <p className="eyebrow">Credential Recovery</p>
          <h1 className="mt-3 text-3xl font-semibold text-[var(--text)]">Reset account password</h1>
          <p className="mt-2 text-sm text-[var(--muted)]">Request a one-time password and set a new ERP password.</p>
        </div>

        {message ? <div className="badge badge-success w-full justify-center py-3">{message}</div> : null}
        {error ? <div className="badge badge-danger w-full justify-center py-3">{error}</div> : null}

        {step === 1 ? (
          <form className="space-y-4" onSubmit={requestOtp}>
            <div>
              <label className="mb-2 block text-sm font-medium text-[var(--text)]">Email</label>
              <input type="email" required value={email} onChange={(event) => setEmail(event.target.value)} />
            </div>
            <button type="submit" disabled={loading} className="primary-button w-full">
              {loading ? 'Requesting OTP...' : 'Send OTP'}
            </button>
          </form>
        ) : (
          <form className="space-y-4" onSubmit={resetPassword}>
            <div>
              <label className="mb-2 block text-sm font-medium text-[var(--text)]">OTP</label>
              <input required value={otp} onChange={(event) => setOtp(event.target.value)} placeholder="6-digit OTP" />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-[var(--text)]">New password</label>
              <input type="password" required value={newPassword} onChange={(event) => setNewPassword(event.target.value)} />
            </div>
            <button type="submit" disabled={loading} className="primary-button w-full">
              {loading ? 'Updating password...' : 'Reset password'}
            </button>
          </form>
        )}

        <div className="flex items-center justify-between text-sm text-[var(--muted)]">
          <Link to="/login" className="text-[var(--primary)]">Back to login</Link>
          {step === 2 ? (
            <button type="button" className="ghost-button" onClick={() => setStep(1)}>
              Use another email
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;

