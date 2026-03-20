const Panel = ({ title, subtitle, actions, children, className = '' }) => (
  <section className={`panel ${className}`}>
    {(title || actions) && (
      <div className="mb-5 flex flex-col gap-3 border-b border-[var(--border)] pb-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          {title ? <h3 className="text-lg font-semibold text-[var(--text)]">{title}</h3> : null}
          {subtitle ? <p className="mt-1 text-sm text-[var(--muted)]">{subtitle}</p> : null}
        </div>
        {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
      </div>
    )}
    {children}
  </section>
);

export default Panel;

