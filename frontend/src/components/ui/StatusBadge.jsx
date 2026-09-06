const toneMap = {
  success: 'badge-success',
  warning: 'badge-warning',
  danger: 'badge-danger',
  info: 'badge-info',
  neutral: 'badge-neutral',
};

const guessTone = (value = '') => {
  const normalized = String(value).toLowerCase();
  if (['paid', 'completed', 'delivered', 'approved', 'active', 'present', 'in stock', 'done'].includes(normalized)) return 'success';
  if (['pending', 'processing', 'lead', 'in progress', 'in review', 'low stock', 'pendingapproval', 'pendingdetails'].includes(normalized)) return 'warning';
  if (['failed', 'cancelled', 'rejected', 'inactive', 'out of stock'].includes(normalized)) return 'danger';
  return 'info';
};

const StatusBadge = ({ children, tone }) => (
  <span className={`badge ${toneMap[tone || guessTone(children)]}`}>{children}</span>
);

export default StatusBadge;

