import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { UserPlus, Phone, MapPin, ArrowRight, ShieldCheck } from 'lucide-react';
import { setCredentials } from '../../store/authSlice';
import api from '../../utils/axiosInstance';

const CompleteProfile = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [form, setForm] = useState({ phone: '', address: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const submitHandler = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { data } = await api.put('/auth/complete-profile', form);
      dispatch(setCredentials(data));
      navigate('/pending-approval');
    } catch (requestError) {
      setError(requestError?.response?.data?.message || 'Unable to update profile credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-6 bg-[radial-gradient(circle_at_top_right,_var(--primary-muted)_0%,_transparent_25%)]">
      <div className="w-full max-w-md">
        <div className="bg-surface border border-border rounded-3xl p-8 shadow-2xl shadow-primary/5">
          <div className="mb-8">
            <div className="h-12 w-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mb-6">
              <UserPlus size={24} />
            </div>
            <h1 className="text-3xl font-black text-text tracking-tighter leading-tight">Finalizing Setup</h1>
            <p className="mt-2 text-sm font-medium text-muted leading-relaxed">
              Complete your secondary identity parameters to initialize your workspace access.
            </p>
          </div>

          <form className="space-y-5" onSubmit={submitHandler}>
            {error && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-100 text-rose-600 text-xs font-bold flex items-center gap-2">
                <ShieldCheck size={14} /> {error}
              </div>
            )}

            <div>
              <label className="text-[10px] font-bold text-text uppercase tracking-widest mb-1.5 block">Primary Contact Number</label>
              <div className="relative group">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-muted group-focus-within:text-primary transition-colors" size={16} />
                <input
                  type="text"
                  required
                  value={form.phone}
                  onChange={(e) => setForm(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="+1 888 000 0000"
                  className="pl-10 h-12 text-sm font-medium"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-bold text-text uppercase tracking-widest mb-1.5 block">Operational Address</label>
              <div className="relative group">
                <MapPin className="absolute left-3 top-4 text-muted group-focus-within:text-primary transition-colors" size={16} />
                <textarea
                  required
                  rows={3}
                  value={form.address}
                  onChange={(e) => setForm(prev => ({ ...prev, address: e.target.value }))}
                  placeholder="Street, Building, City, ZIP..."
                  className="pl-10 py-3 text-sm font-medium bg-surface-muted border-none focus:ring-1 focus:ring-primary w-full rounded-xl"
                />
              </div>
            </div>

            <div className="pt-4">
              <button 
                type="submit" 
                disabled={loading} 
                className="primary-button w-full h-12 text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 group"
              >
                {loading ? 'Synchronizing...' : (
                  <>
                    Finalize Registration <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
        
        <p className="mt-8 text-center text-[10px] font-bold text-muted uppercase tracking-[0.2em]">
          Enterprise Grade Security • 256-bit Encryption
        </p>
      </div>
    </div>
  );
};

export default CompleteProfile;
