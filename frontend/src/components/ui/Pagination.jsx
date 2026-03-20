const Pagination = ({ pagination, onPageChange }) => {
  if (!pagination || pagination.totalPages <= 1) return null;

  return (
    <div className="mt-4 flex items-center justify-end gap-2">
      <button
        type="button"
        className="secondary-button"
        disabled={pagination.page === 1}
        onClick={() => onPageChange(pagination.page - 1)}
      >
        Previous
      </button>
      <span className="px-3 text-sm text-[var(--muted)]">
        Page {pagination.page} of {pagination.totalPages}
      </span>
      <button
        type="button"
        className="secondary-button"
        disabled={pagination.page === pagination.totalPages}
        onClick={() => onPageChange(pagination.page + 1)}
      >
        Next
      </button>
    </div>
  );
};

export default Pagination;

