import { useEffect, useState } from 'react';
import { Activity, BellRing, BriefcaseBusiness, CircleDollarSign, ClipboardList, TriangleAlert } from 'lucide-react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import api from '../../utils/axiosInstance';
import PageHeader from '../../components/ui/PageHeader';
import MetricCard from '../../components/ui/MetricCard';
import Panel from '../../components/ui/Panel';
import LoadingState from '../../components/ui/LoadingState';
import StatusBadge from '../../components/ui/StatusBadge';
import { formatCurrency, formatShortDate } from '../../utils/formatters';

const chartColors = ['#0f766e', '#ea580c', '#0284c7', '#7c3aed'];

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const { data: summary } = await api.get('/dashboard/summary');
        setData(summary);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  if (loading) {
    return <LoadingState label="Loading dashboard intelligence..." />;
  }

  if (!data) {
    return <LoadingState label="Unable to load dashboard data." />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Business control tower"
        description="Track headcount, revenue, approvals, task execution, and operational alerts from a single ERP dashboard."
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Employees" value={data.stats.totalEmployees} helper="Active non-admin workforce" icon={<BriefcaseBusiness size={22} />} tone="primary" />
        <MetricCard label="Revenue" value={formatCurrency(data.stats.revenue)} helper={`Balance ${formatCurrency(data.stats.balance)}`} icon={<CircleDollarSign size={22} />} tone="success" />
        <MetricCard label="Pending tasks" value={data.stats.pendingTasks} helper="Across all assignees" icon={<ClipboardList size={22} />} tone="warning" />
        <MetricCard label="Notifications" value={data.stats.notifications} helper={`${data.stats.lowStock} low stock alerts`} icon={<BellRing size={22} />} tone="danger" />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
        <Panel title="Revenue movement" subtitle="Monthly order revenue mapped from sales activity.">
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.revenueData}>
                <defs>
                  <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0f766e" stopOpacity={0.45} />
                    <stop offset="95%" stopColor="#0f766e" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(148,163,184,0.18)" />
                <XAxis dataKey="name" stroke="var(--muted)" />
                <YAxis stroke="var(--muted)" />
                <Tooltip contentStyle={{ background: 'var(--surface-strong)', borderRadius: 18, border: '1px solid var(--border)' }} />
                <Area type="monotone" dataKey="revenue" stroke="#0f766e" fill="url(#revenueFill)" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        <Panel title="Department distribution" subtitle="Current workforce split by department.">
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={data.departmentBreakdown} dataKey="value" nameKey="name" innerRadius={70} outerRadius={110} paddingAngle={4}>
                  {data.departmentBreakdown.map((entry, index) => (
                    <Cell key={entry.name} fill={chartColors[index % chartColors.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: 'var(--surface-strong)', borderRadius: 18, border: '1px solid var(--border)' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 grid gap-2">
            {data.departmentBreakdown.map((entry, index) => (
              <div key={entry.name} className="flex items-center justify-between rounded-2xl bg-[var(--surface-muted)] px-4 py-3 text-sm">
                <div className="flex items-center gap-3">
                  <span className="h-3 w-3 rounded-full" style={{ backgroundColor: chartColors[index % chartColors.length] }} />
                  <span className="text-[var(--text)]">{entry.name}</span>
                </div>
                <span className="text-[var(--muted)]">{entry.value}</span>
              </div>
            ))}
          </div>
        </Panel>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <Panel title="Recent activity" subtitle="Latest business events collected from orders and system notifications.">
          <div className="space-y-3">
            {data.recentActivities.map((activity) => (
              <div key={activity.id} className="rounded-3xl border border-[var(--border)] bg-[var(--surface-muted)] px-5 py-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="rounded-2xl bg-[rgba(15,118,110,0.1)] p-3 text-[var(--primary)]">
                      <Activity size={18} />
                    </div>
                    <div>
                      <p className="font-medium text-[var(--text)]">{activity.title}</p>
                      <p className="text-sm text-[var(--muted)]">{activity.description}</p>
                    </div>
                  </div>
                  <span className="text-xs text-[var(--muted)]">{formatShortDate(activity.createdAt)}</span>
                </div>
              </div>
            ))}
          </div>
        </Panel>

        <Panel title="Operational alerts" subtitle="Pending approvals and stock exceptions requiring action.">
          <div className="space-y-3">
            {data.alerts.lowStockProducts.map((product) => (
              <div key={product._id} className="rounded-3xl border border-[var(--border)] px-4 py-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <TriangleAlert size={18} className="text-amber-500" />
                    <div>
                      <p className="font-medium text-[var(--text)]">{product.name}</p>
                      <p className="text-sm text-[var(--muted)]">{product.quantity} units remaining</p>
                    </div>
                  </div>
                  <StatusBadge>{product.status}</StatusBadge>
                </div>
              </div>
            ))}
            {data.alerts.pendingLeaves.map((leave) => (
              <div key={leave._id} className="rounded-3xl border border-[var(--border)] px-4 py-4">
                <p className="font-medium text-[var(--text)]">Leave approval pending</p>
                <p className="mt-1 text-sm text-[var(--muted)]">{leave.employee?.name}</p>
                <p className="mt-2 text-xs text-[var(--muted)]">Submitted {formatShortDate(leave.createdAt)}</p>
              </div>
            ))}
            {!data.alerts.lowStockProducts.length && !data.alerts.pendingLeaves.length ? (
              <p className="rounded-3xl bg-[var(--surface-muted)] px-4 py-8 text-center text-sm text-[var(--muted)]">No critical alerts right now.</p>
            ) : null}
          </div>
        </Panel>
      </div>
    </div>
  );
};

export default Dashboard;

