import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Users, DollarSign, ListTodo, ShoppingBag, Clock, ArrowUpRight, Activity } from 'lucide-react';
import PageHeader from '../../components/ui/PageHeader';
import MetricCard from '../../components/ui/MetricCard';
import Panel from '../../components/ui/Panel';
import { formatCurrency } from '../../utils/formatters';

const AdminDashboard = ({ data }) => {
  const { stats, revenueData, recentActivities } = data || { stats: null, revenueData: [], recentActivities: [] };

  return (
    <div className="space-y-6 pb-12">
      <PageHeader 
        title="Administrative Command" 
        description="High-level operational overview and critical system metrics for authorized personnel."
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard 
          label="Gross Revenue" 
          value={formatCurrency(stats?.totalRevenue || 0)} 
          icon={<DollarSign size={20} />} 
          tone="success" 
          helper="+12.4% from last billing cycle"
        />
        <MetricCard 
          label="Human Capital" 
          value={stats?.totalEmployees || 0} 
          icon={<Users size={20} />} 
          tone="primary" 
          helper="Active workforce"
        />
        <MetricCard 
          label="Operational Backlog" 
          value={stats?.pendingTasks || 0} 
          icon={<ListTodo size={20} />} 
          tone="warning" 
          helper="Awaiting resolution"
        />
        <MetricCard 
          label="Commercial Volume" 
          value={stats?.totalOrders || 0} 
          icon={<ShoppingBag size={20} />} 
          tone="primary" 
          helper="Cumulative orders"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Panel 
          title="Revenue Intelligence" 
          subtitle="Time-series analysis of commercial performance metrics."
          className="lg:col-span-2"
        >
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="adminRevenueFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: 'var(--muted)', fontSize: 11, fontWeight: 'bold'}} 
                  dy={10} 
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: 'var(--muted)', fontSize: 11, fontWeight: 'bold'}} 
                  tickFormatter={(val) => `₹${val/1000}k`} 
                />
                <Tooltip 
                  contentStyle={{ 
                    background: 'var(--surface-strong)', 
                    borderRadius: '12px', 
                    border: '1px solid var(--border)', 
                    boxShadow: 'var(--shadow-xl)',
                    color: 'var(--text)'
                  }} 
                  formatter={(value) => [formatCurrency(value), 'Revenue']} 
                />
                <Area 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="var(--primary)" 
                  strokeWidth={3} 
                  fillOpacity={1} 
                  fill="url(#adminRevenueFill)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        <Panel 
          title="Operational Feed" 
          subtitle="Real-time system event synchronization."
        >
          <div className="space-y-5">
            {recentActivities.map((activity, idx) => (
              <div key={idx} className="flex gap-4 group">
                <div className="flex-shrink-0 mt-1 h-8 w-8 rounded-lg bg-surface-muted border border-border flex items-center justify-center text-muted group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                  <Activity size={14} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-text tracking-tight uppercase tracking-tighter">{activity.action}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] font-bold text-muted uppercase tracking-widest">{activity.user}</span>
                    <span className="h-1 w-1 rounded-full bg-border" />
                    <span className="text-[10px] font-bold text-muted uppercase tracking-widest flex items-center gap-1">
                      <Clock size={10} /> {activity.time}
                    </span>
                  </div>
                </div>
              </div>
            ))}
            {!recentActivities.length && (
              <div className="text-center py-12 opacity-40">
                <p className="text-xs font-bold text-muted uppercase tracking-widest">No activity reported.</p>
              </div>
            )}
          </div>
          <button className="w-full mt-6 h-10 text-[10px] font-bold text-primary uppercase tracking-widest border border-primary/20 rounded-xl hover:bg-primary/5 transition-all">
            Full Audit Workspace <ArrowUpRight size={14} className="inline ml-1" />
          </button>
        </Panel>
      </div>
    </div>
  );
};

export default AdminDashboard;
