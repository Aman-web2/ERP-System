import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
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

  const canApprove = ['Admin', 'HR'].includes(userInfo?.role);

  const fetchData = async () => {
    setLoading(true);
    try {
      const requests = [api.get('/leaves/my?limit=10'), api.get('/attendance/my?limit=10')];
      if (canApprove) {
        requests.push(api.get('/leaves?limit=10&status=Pending'));
      }
      const [leaveResponse, attendanceResponse, approvalResponse] = await Promise.all(requests);
      setMyLeaves(leaveResponse.data.items || []);
      setMyAttendance(attendanceResponse.data.items || []);
      setApprovals(approvalResponse?.data?.items || []);
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
    await api.post(`/attendance/${endpoint}`);
    fetchData();
  };

  const reviewLeave = async (id, status) => {
    await api.put(`/leaves/${id}/status`, { status, adminComment: `${status} by ${userInfo.role}` });
    fetchData();
  };

  if (loading) {
    return <LoadingState label="Loading leave and attendance center..." />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Leave and attendance"
        description="Submit leave requests, track your attendance history, and handle approvals when you have HR authority."
        actions={
          <div className="flex gap-3">
            <button className="secondary-button" onClick={() => markAttendance('clock-in')}>Clock in</button>
            <button className="primary-button" onClick={() => markAttendance('clock-out')}>Clock out</button>
          </div>
        }
      />

      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <Panel title="Apply for leave" subtitle="Submit leave requests with dates and reason.">
          <form className="space-y-4" onSubmit={submitLeave}>
            <select value={leaveForm.leaveType} onChange={(event) => setLeaveForm((current) => ({ ...current, leaveType: event.target.value }))}>
              <option value="Annual">Annual</option>
              <option value="Sick">Sick</option>
              <option value="Casual">Casual</option>
              <option value="Maternity">Maternity</option>
              <option value="Paternity">Paternity</option>
              <option value="Unpaid">Unpaid</option>
            </select>
            <div className="field-grid two">
              <input type="date" value={leaveForm.startDate} onChange={(event) => setLeaveForm((current) => ({ ...current, startDate: event.target.value }))} required />
              <input type="date" value={leaveForm.endDate} onChange={(event) => setLeaveForm((current) => ({ ...current, endDate: event.target.value }))} required />
            </div>
            <textarea rows="4" value={leaveForm.reason} onChange={(event) => setLeaveForm((current) => ({ ...current, reason: event.target.value }))} placeholder="Reason for leave" required />
            <button type="submit" className="primary-button">Submit request</button>
          </form>
        </Panel>

        <Panel title="My leave requests" subtitle="Recent requests and approval status.">
          <div className="table-shell">
            <table>
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Range</th>
                  <th>Status</th>
                  <th>Comment</th>
                </tr>
              </thead>
              <tbody>
                {myLeaves.map((leave) => (
                  <tr key={leave._id}>
                    <td>{leave.leaveType}</td>
                    <td>{formatDate(leave.startDate)} - {formatDate(leave.endDate)}</td>
                    <td><StatusBadge>{leave.status}</StatusBadge></td>
                    <td>{leave.adminComment || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <Panel title="My attendance log" subtitle="Latest attendance records captured by the system.">
          <div className="space-y-3">
            {myAttendance.map((record) => (
              <div key={record._id} className="rounded-3xl border border-[var(--border)] px-4 py-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-[var(--text)]">{formatDate(record.date)}</p>
                    <p className="text-sm text-[var(--muted)]">
                      In {record.clockIn ? new Date(record.clockIn).toLocaleTimeString() : '-'} | Out {record.clockOut ? new Date(record.clockOut).toLocaleTimeString() : '-'}
                    </p>
                  </div>
                  <StatusBadge>{record.status}</StatusBadge>
                </div>
              </div>
            ))}
          </div>
        </Panel>

        {canApprove ? (
          <Panel title="Pending approvals" subtitle="Approve or reject leave requests awaiting HR review.">
            <div className="space-y-3">
              {approvals.map((leave) => (
                <div key={leave._id} className="rounded-3xl border border-[var(--border)] px-4 py-4">
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                      <p className="font-medium text-[var(--text)]">{leave.employee?.name}</p>
                      <p className="text-sm text-[var(--muted)]">{leave.leaveType} | {formatDate(leave.startDate)} - {formatDate(leave.endDate)}</p>
                      <p className="mt-2 text-sm text-[var(--muted)]">{leave.reason}</p>
                    </div>
                    <div className="flex gap-2">
                      <button className="secondary-button" onClick={() => reviewLeave(leave._id, 'Approved')}>Approve</button>
                      <button className="danger-button" onClick={() => reviewLeave(leave._id, 'Rejected')}>Reject</button>
                    </div>
                  </div>
                </div>
              ))}
              {!approvals.length ? <p className="text-sm text-[var(--muted)]">No pending approvals.</p> : null}
            </div>
          </Panel>
        ) : null}
      </div>
    </div>
  );
};

export default LeaveManagement;

