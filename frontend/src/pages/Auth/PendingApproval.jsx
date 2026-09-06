import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logoutUserStore } from '../../store/authSlice';
import api from '../../utils/axiosInstance';
import { ShieldCheck, LogOut, Clock } from 'lucide-react';

const PendingApproval = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout');
      dispatch(logoutUserStore());
      navigate('/login');
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-6 bg-[radial-gradient(circle_at_bottom_left,_var(--primary-muted)_0%,_transparent_25%)]">
      <div className="w-full max-w-md">
        <div className="bg-surface border border-border rounded-3xl p-8 shadow-2xl shadow-primary/5 text-center">
          <div className="mx-auto h-20 w-20 bg-primary/10 border border-primary/20 text-primary rounded-full flex items-center justify-center mb-8 relative">
            <ShieldCheck size={40} />
            <div className="absolute -bottom-1 -right-1 h-8 w-8 bg-surface border border-border rounded-full flex items-center justify-center text-amber-500 shadow-sm">
              <Clock size={16} />
            </div>
          </div>
          
          <div className="space-y-4">
            <h1 className="text-3xl font-black text-text tracking-tighter leading-tight">Identity Verification</h1>
            
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 border border-amber-100 text-amber-600 text-[10px] font-bold uppercase tracking-widest">
              Awaiting Administrative Review
            </div>

            <p className="text-sm font-medium text-text leading-relaxed pt-2">
              Your credentials have been successfully synchronized with our security protocols.
            </p>

            <p className="text-xs text-muted leading-relaxed">
              To ensure compliance and data integrity, an organization administrator must manually authorize your workspace access. This process typically concludes within one business cycle.
            </p>
          </div>

          <div className="mt-10 pt-8 border-t border-border">
            <button 
              onClick={handleLogout} 
              className="secondary-button w-full h-12 text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2"
            >
              <LogOut size={16} /> Secure Termination
            </button>
          </div>
        </div>

        <div className="mt-8 flex items-center justify-center gap-6">
          <div className="flex items-center gap-2">
            <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            <span className="text-[10px] font-bold text-muted uppercase tracking-wider">System Operational</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-1.5 w-1.5 rounded-full bg-primary" />
            <span className="text-[10px] font-bold text-muted uppercase tracking-wider">Verification Phase 2/2</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PendingApproval;
