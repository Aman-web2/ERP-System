import { ShoppingCart, Users, TrendingUp, Package, ArrowUpRight, BarChart3 } from 'lucide-react';
import { Link } from 'react-router-dom';
import PageHeader from '../../components/ui/PageHeader';
import MetricCard from '../../components/ui/MetricCard';
import Panel from '../../components/ui/Panel';
import { formatCurrency } from '../../utils/formatters';

const SalesDashboard = ({ data }) => {
  const statCards = [
    { title: 'Total Sales (Month)', value: formatCurrency(data?.stats?.revenue || 0), icon: <BarChart3 size={20} />, tone: 'success' },
    { title: 'Active Leads', value: 24, icon: <Users size={20} />, tone: 'primary' },
    { title: 'Orders Pending', value: data?.stats?.totalOrders || 0, icon: <ShoppingCart size={20} />, tone: 'warning' },
    { title: 'Low Stock SKU', value: data?.stats?.lowStock || 0, icon: <Package size={20} />, tone: 'danger' },
  ];

  return (
    <div className="space-y-6 pb-12">
      <PageHeader 
        title="Commercial Intelligence" 
        description="Monitor sales velocity, manage customer relationships, and optimize fulfillment pipelines."
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, idx) => (
          <MetricCard 
            key={idx}
            label={card.title}
            value={card.value}
            icon={card.icon}
            tone={card.tone}
          />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
         <Panel 
           title="Sales Governance" 
           subtitle="Primary administrative actions for commercial operations."
           className="lg:col-span-1"
         >
          <div className="grid grid-cols-1 gap-3">
            <Link to="/crm" className="p-4 rounded-xl border border-border bg-surface hover:border-blue-200 hover:bg-blue-50/30 transition-all flex items-center justify-between group">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
                  <Users size={20} />
                </div>
                <span className="text-sm font-bold text-text uppercase tracking-tighter">Client Directory</span>
              </div>
              <ArrowUpRight size={16} className="text-muted group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </Link>
            <Link to="/sales" className="p-4 rounded-xl border border-border bg-surface hover:border-emerald-200 hover:bg-emerald-50/30 transition-all flex items-center justify-between group">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center">
                  <ShoppingCart size={20} />
                </div>
                <span className="text-sm font-bold text-text uppercase tracking-tighter">Generate Order</span>
              </div>
              <ArrowUpRight size={16} className="text-muted group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </Link>
          </div>
        </Panel>

        <Panel 
          title="Conversion Analytics" 
          subtitle="Real-time verification of departmental sales performance."
          className="lg:col-span-2"
        >
          <div className="h-48 flex items-center justify-center border border-dashed border-border rounded-xl bg-surface-muted/30">
            <div className="text-center opacity-40">
              <TrendingUp size={32} className="mx-auto mb-2" />
              <p className="text-[10px] font-bold text-muted uppercase tracking-widest">Sales Velocity Heatmap coming soon</p>
            </div>
          </div>
        </Panel>
      </div>
    </div>
  );
};

export default SalesDashboard;
