const Modal = ({ open, title, children, onClose, width = 'max-w-2xl' }) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 p-4 backdrop-blur-sm">
      <div className={`panel w-full ${width} max-h-[90vh] overflow-y-auto`}>
        <div className="mb-5 flex items-center justify-between border-b border-[var(--border)] pb-4">
          <h3 className="text-xl font-semibold text-[var(--text)]">{title}</h3>
          <button type="button" className="ghost-button" onClick={onClose}>Close</button>
        </div>
        {children}
      </div>
    </div>
  );
};

export default Modal;

