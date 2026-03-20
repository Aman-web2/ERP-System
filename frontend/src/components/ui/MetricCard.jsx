const toneClasses = {
  primary: 'from-teal-500/20 to-cyan-500/10 text-teal-100 ring-teal-400/20',
  success: 'from-emerald-500/20 to-lime-500/10 text-emerald-100 ring-emerald-400/20',
  warning: 'from-amber-500/20 to-orange-500/10 text-amber-100 ring-amber-400/20',
  danger: 'from-rose-500/20 to-red-500/10 text-rose-100 ring-rose-400/20',
};

const MetricCard = ({ label, value, helper, icon, tone = 'primary' }) => (
  <div className="metric-card">
    <div className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${toneClasses[tone]} ring-1`}>
      {icon}
    </div>
    <div className="space-y-1">
      <p className="text-sm text-[var(--muted)]">{label}</p>
      <h3 className="text-2xl font-semibold text-[var(--text)]">{value}</h3>
      {helper ? <p className="text-xs text-[var(--muted)]">{helper}</p> : null}
    </div>
  </div>
);

export default MetricCard;

