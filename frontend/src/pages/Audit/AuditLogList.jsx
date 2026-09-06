import { useEffect, useState } from 'react';
import api from '../../utils/axiosInstance';
import PageHeader from '../../components/ui/PageHeader';
import Panel from '../../components/ui/Panel';
import Pagination from '../../components/ui/Pagination';
import LoadingState from '../../components/ui/LoadingState';
import StatusBadge from '../../components/ui/StatusBadge';
import { formatDate, getPaginationText } from '../../utils/formatters';

const AuditLogList = () => {
  const [logs, setLogs] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const fetchLogs = async (currentPage = 1) => {
    setLoading(true);
    try {
      const { data } = await api.get(`/audit?page=${currentPage}&limit=12`);
      setLogs(data.items || []);
      setPagination(data.pagination);
    } catch (error) {
      console.error('Error fetching audit logs:', error);
      // Fail gracefully while the backend API isn't fully set up for the student
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs(page);
  }, [page]);

  if (loading && page === 1) {
    return <LoadingState label="Loading activity logs..." />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Activity Logs"
        description="Monitor system actions, data changes, and compliance history."
      />

      <Panel title="System History" subtitle={getPaginationText(pagination)}>
        <div className="table-shell">
          <table>
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>Performed By</th>
                <th>Action</th>
                <th>Entity</th>
                <th>Details</th>
              </tr>
            </thead>
            <tbody>
              {logs.length > 0 ? (
                logs.map((log) => (
                  <tr key={log._id}>
                    <td>
                      <p className="text-[var(--text)]">{formatDate(log.createdAt)}</p>
                      <p className="text-xs text-[var(--muted)]">{new Date(log.createdAt).toLocaleTimeString()}</p>
                    </td>
                    <td>
                      <p className="font-medium text-[var(--text)]">{log.performedBy?.name || 'System'}</p>
                      <p className="text-xs text-[var(--muted)]">{log.performedBy?.role || 'System'}</p>
                    </td>
                    <td>
                      <StatusBadge>{log.action}</StatusBadge>
                    </td>
                    <td>{log.entity}</td>
                    <td><p className="text-sm text-[var(--muted)]">{log.details}</p></td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="text-center text-[var(--muted)] py-6">
                    No activity logs found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {pagination && pagination.pages > 1 && (
          <Pagination
            pagination={pagination}
            onPageChange={(nextPage) => setPage(nextPage)}
          />
        )}
      </Panel>
    </div>
  );
};

export default AuditLogList;
