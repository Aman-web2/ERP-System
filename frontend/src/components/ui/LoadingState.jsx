const LoadingState = ({ label = 'Loading data...' }) => (
  <div className="rounded-3xl border border-dashed border-[var(--border)] px-6 py-16 text-center text-sm text-[var(--muted)]">
    {label}
  </div>
);

export default LoadingState;

