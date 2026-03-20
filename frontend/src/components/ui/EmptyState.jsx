const EmptyState = ({ title = 'No records found', description = 'Try changing the filters or create a new record.' }) => (
  <div className="rounded-3xl border border-dashed border-[var(--border)] px-6 py-16 text-center">
    <h3 className="text-lg font-semibold text-[var(--text)]">{title}</h3>
    <p className="mt-2 text-sm text-[var(--muted)]">{description}</p>
  </div>
);

export default EmptyState;

