const PageHeader = ({ title, description, actions }) => (
  <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
    <div>
      <p className="eyebrow">Production ERP Workspace</p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[var(--text)]">{title}</h1>
      {description ? <p className="mt-2 max-w-2xl text-sm text-[var(--muted)]">{description}</p> : null}
    </div>
    {actions ? <div className="flex flex-wrap gap-3">{actions}</div> : null}
  </div>
);

export default PageHeader;

