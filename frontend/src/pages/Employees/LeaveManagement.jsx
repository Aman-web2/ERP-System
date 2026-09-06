import { useEffect, useState, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { Calendar, Clock, CheckCircle2, XCircle, AlertCircle, ArrowRight, UserCheck } from 'lucide-react';
import api from '../../utils/axiosInstance';
import PageHeader from '../../components/ui/PageHeader';
import Panel from '../../components/ui/Panel';
import StatusBadge from '../../components/ui/StatusBadge';
import LoadingState from '../../components/ui/LoadingState';
import { formatDate } from '../../utils/formatters';

const LeaveManagement = () => {
  const { userInfo } = useSelector((state) => state.auth);
  const [leaveForm, setLeaveForm] = useState({ leaveType: 'Annual', startDate: '', endDate: '', reason: '' });
  const [myLeaves, setMyLeaves] = useState([]);
  const [myAttendance, setMyAttendance] = useState([]);
  const [approvals, setApprovals] = useState([]);
  const [loading, setLoading] = useState(true);

  const canApprove = useMemo(() => ['Admin', 'HR'].includes(userInfo?.role), [userInfo]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const requests = [api.get('/leaves/my?limit=20'), api.get('/attendance/my?limit=20')];
      if (canApprove) {
        requests.push(api.get('/leaves?limit=20&status=Pending'));
      }
      const responses = await Promise.all(requests);
      setMyLeaves(responses[0].data.items || []);
      setMyAttendance(responses[1].data.items || []);
      if (canApprove) setApprovals(responses[2].data.items || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const submitLeave = async (event) => {
    event.preventDefault();
    await api.post('/leaves', leaveForm);
    setLeaveForm({ leaveType: 'Annual', startDate: '', endDate: '', reason: '' });
    fetchData();
  };

  const markAttendance = async (endpoint) => {
    try {
      await api.post(`/attendance/${endpoint}`);
      fetchData();
    } catch (error) {
      console.error(error);
      alert(error?.response?.data?.message || 'Access denied or network error.');
    }
  };

  const reviewLeave = async (id, status) => {
    await api.put(`/leaves/${id}/status`, { status, adminComment: `System verified by ${userInfo.role}` });
    fetchData();
  };

  if (loading) {
    return <LoadingState label="Synchronizing time-tracking data..." />;
  }

  const todayRecord = myAttendance.find((record) => new Date(record.date).toDateString() === new Date().toDateString());
  const hasClockedIn = Boolean(todayRecord?.clockIn);
  const hasClockedOut = Boolean(todayRecord?.clockOut);

  return (
    <div className="space-y-6 pb-12">
      <PageHeader
        title="Time & Attendance"
        description="Monitor workforce presence, manage leave entitlements, and process departmental time-off requests."
        actions={
          <div className="flex gap-3">
            <button 
              className={`h-10 px-6 text-xs font-bold uppercase tracking-widest transition-all rounded-lg border ${hasClockedIn ? 'bg-surface-muted text-muted border-border cursor-not-allowed' : 'secondary-button'}`} 
              onClick={() => markAttendance('clock-in')} 
              disabled={hasClockedIn}
            >
              System Clock In
            </button>
            <button 
              className={`h-10 px-6 text-xs font-bold uppercase tracking-widest transition-all rounded-lg border ${!hasClockedIn || hasClockedOut ? 'bg-surface-muted text-muted border-border cursor-not-allowed' : 'primary-button'}`} 
              onClick={() => markAttendance('clock-out')} 
              disabled={!hasClockedIn || hasClockedOut}
            >
              System Clock Out
            </button>
          </div>
        }
      />

      <div className="grid gap-6 xl:grid-cols-[1fr_1.5fr]">
        <Panel title="Leave Application" subtitle="Initialize new time-off requests for HR verification.">
          <form className="space-y-4" onSubmit={submitLeave}>
            <div>
              <label className="text-[10px] font-bold text-text uppercase tracking-widest mb-1.5 block">Absence Classification</label>
              <select className="h-11 text-sm font-medium" value={leaveForm.leaveType} onChange={(e) => setLeaveForm(prev => ({ ...prev, leaveType: e.target.value }))}>
                <option value="Annual">Annual Paid Leave</option>
                <option value="Sick">Medical Leave</option>
                <option value="Casual">Short-term Casual</option>
                <option value="Maternity">Maternity Cycle</option>
                <option value="Paternity">Paternity Cycle</option>
                <option value="Unpaid">Unpaid Personal</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-bold text-text uppercase tracking-widest mb-1.5 block">Start Date</label>
                <input className="h-11 text-sm" type="date" value={leaveForm.startDate} onChange={(e) => setLeaveForm(prev => ({ ...prev, startDate: e.target.value }))} required />
              </div>
              <div>
                <label className="text-[10px] font-bold text-text uppercase tracking-widest mb-1.5 block">End Date</label>
                <input className="h-11 text-sm" type="date" value={leaveForm.endDate} onChange={(e) => setLeaveForm(prev => ({ ...prev, endDate: e.target.value }))} required />
              </div>
            </div>
            <div>
              <label className="text-[10px] font-bold text-text uppercase tracking-widest mb-1.5 block">Technical Justification</label>
              <textarea rows="4" className="text-sm bg-surface-muted border-none focus:ring-1 focus:ring-primary" value={leaveForm.reason} onChange={(e) => setLeaveForm(prev => ({ ...prev, reason: e.target.value }))} placeholder="Provide context for this request..." required />
            </div>
            <button type="submit" className="primary-button w-full h-11 text-[11px] font-bold uppercase tracking-widest">Submit for Review</button>
          </form>
        </Panel>

        <Panel title="Personal Entitlements" subtitle="Historical leave records and current tracking status.">
          <div className="table-shell">
            <table>
              <thead>
                <tr>
                  <th className="text-[10px] uppercase font-black tracking-widest">Classification</th>
                  <th className="text-[10px] uppercase font-black tracking-widest">Duration Cycle</th>
                  <th className="text-[10px] uppercase font-black tracking-widest">Verification</th>
                  <th className="text-[10px] uppercase font-black tracking-widest">Admin Note</th>
                </tr>
              </thead>
              <tbody>
                {myLeaves.map((leave) => (
                  <tr key={leave._id} className="hover:bg-primary/5 transition-colors">
                    <td className="text-sm font-bold text-text">{leave.leaveType}</td>
                    <td className="text-[11px] font-medium text-muted tabular-nums uppercase">
                      {formatDate(leave.startDate)} <ArrowRight size={10} className="inline mx-1" /> {formatDate(leave.endDate)}
                    </td>
                    <td><StatusBadge>{leave.status}</StatusBadge></td>
                    <td className="text-xs text-muted font-medium">{leave.adminComment || '--'}</td>
                  </tr>
                ))}
                {!myLeaves.length && (
                  <tr>
                    <td colSpan="4" className="text-center py-12">
                      <p className="text-[10px] font-bold text-muted uppercase tracking-widest italic">No historical leave records detected.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Panel>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_1.5fr]">
        <Panel title="Activity Log" subtitle="Verified operational presence and clocking cycles.">
          <div className="space-y-3">
            {myAttendance.map((record) => (
              <div key={record._id} className="group p-4 rounded-xl border border-border bg-surface hover:border-primary/20 transition-all">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 flex items-center justify-center rounded-lg bg-surface-muted text-muted group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                      <Calendar size={18} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-text tracking-tight">{formatDate(record.date)}</p>
                      <div className="flex items-center gap-3 mt-1">
                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-muted uppercase">
                          <Clock size={12} className="text-emerald-500" /> {record.clockIn ? new Date(record.clockIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--'}
                        </div>
                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-muted uppercase">
                          <Clock size={12} className="text-rose-500" /> {record.clockOut ? new Date(record.clockOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--'}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <StatusBadge>{record.status || 'Active'}</StatusBadge>
                  </div>
                </div>
              </div>
            ))}
            {!myAttendance.length && (
              <div className="p-12 text-center border border-dashed border-border rounded-xl">
                 <p className="text-[10px] font-bold text-muted uppercase tracking-widest">No activity reported.</p>
              </div>
            )}
          </div>
        </Panel>

        {canApprove && (
          <Panel title="Approval Pipeline" subtitle="Departmental absence requests requiring immediate attention.">
            <div className="space-y-4">
              {approvals.map((leave) => (
                <div key={leave._id} className="p-5 rounded-xl border border-border bg-surface-muted/30 hover:border-primary/20 transition-all">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center justify-between">
                    <div className="flex items-start gap-4">
                      <div className="h-12 w-12 flex items-center justify-center rounded-full bg-primary/10 text-primary border border-primary/20 font-bold text-sm">
                        {leave.employee?.name?.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-text tracking-tight">{leave.employee?.name}</p>
                        <p className="text-[11px] font-bold text-muted mt-0.5 uppercase tracking-wide">
                          {leave.leaveType} • {formatDate(leave.startDate)} to {formatDate(leave.endDate)}
                        </p>
                        <div className="mt-3 p-3 rounded-lg bg-surface border border-border text-xs text-muted leading-relaxed italic">
                          "{leave.reason}"
                        </div>
                      </div>
                    </div>
                    <div className="flex lg:flex-col gap-2 shrink-0">
                      <button className="primary-button h-10 px-4 text-[10px] font-bold uppercase tracking-widest flex items-center gap-2" onClick={() => reviewLeave(leave._id, 'Approved')}>
                        <CheckCircle2 size={14} /> Approve
                      </button>
                      <button className="ghost-button h-10 px-4 text-[10px] font-bold uppercase tracking-widest text-rose-500 hover:bg-rose-50 flex items-center gap-2" onClick={() => reviewLeave(leave._id, 'Rejected')}>
                        <XCircle size={14} /> Reject
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              {!approvals.length && (
                <div className="flex flex-col items-center justify-center h-64 text-center opacity-40 border border-dashed border-border rounded-xl">
                  <UserCheck size={32} className="mb-3" />
                  <p className="text-[10px] font-bold text-text uppercase tracking-widest">Queue Clear</p>
                  <p className="text-xs font-medium text-muted mt-1">No pending leave requests for review.</p>
                </div>
              )}
            </div>
          </Panel>
        )}
      </div>
    </div>
  );
};

export default LeaveManagement;

