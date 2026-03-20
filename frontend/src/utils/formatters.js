export const formatCurrency = (value = 0, currency = 'INR') =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(Number(value || 0));

export const formatDate = (value, options = {}) => {
  if (!value) return '-';
  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    ...options,
  }).format(new Date(value));
};

export const formatShortDate = (value) => formatDate(value, { month: 'short', day: 'numeric' });

export const formatNumber = (value = 0) => new Intl.NumberFormat('en-IN').format(Number(value || 0));

export const getPaginationText = (pagination) => {
  if (!pagination) return 'No records';
  const start = (pagination.page - 1) * pagination.limit + 1;
  const end = Math.min(pagination.page * pagination.limit, pagination.total);
  return `Showing ${start}-${end} of ${pagination.total}`;
};

