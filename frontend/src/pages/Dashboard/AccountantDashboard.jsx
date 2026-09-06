import { FileText, ArrowUpRight, ArrowDownRight, Landmark, CreditCard } from 'lucide-react';
import { Link } from 'react-router-dom';
import PageHeader from '../../components/ui/PageHeader';
import MetricCard from '../../components/ui/MetricCard';
import Panel from '../../components/ui/Panel';
import { formatCurrency } from '../../utils/formatters';

const AccountantDashboard = ({ data }) => {
  const statCards = [
    { title: 'Cash Balance', value: formatCurrency(data?.stats?.balance || 0), icon: <Landmark size={20} />, tone: 'success' },
    { title: 'Pending Invoices', value: data?.stats?.pendingTasks || 0, icon: <FileText size={20} />, tone: 'warning' },
    { title: 'MTD Income', value: formatCurrency(data?.stats?.revenue || 0), icon: <ArrowUpRight size={20} />, tone: 'primary' },
    { title: 'MTD Expenses', value: formatCurrency(15200), icon: <ArrowDownRight size={20} />, tone: 'danger' },
  ];

  return (
    <div className="space-y-6 pb-12">
      <PageHeader 
        title="Fiscal Operations" 
        description="Comprehensive ledger monitoring, liquidity tracking, and institutional financial reporting."
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
           title="Financial Control" 
           subtitle="Primary administrative actions for bookkeeping."
           className="lg:col-span-1"
        >
          <div className="grid grid-cols-1 gap-3">
            <Link to="/finance" className="p-4 rounded-xl border border-border bg-surface hover:border-primary/20 hover:bg-primary/5 transition-all flex items-center justify-between group">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                  <Landmark size={20} />
                </div>
                <span className="text-sm font-bold text-text uppercase tracking-tighter">General Ledger</span>
              </div>
              <ArrowUpRight size={16} className="text-muted group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </Link>
            <button className="p-4 rounded-xl border border-border bg-surface hover:border-indigo-200 hover:bg-indigo-50/30 transition-all flex items-center justify-between group w-full text-left">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center">
                  <CreditCard size={20} />
                </div>
                <span className="text-sm font-bold text-text uppercase tracking-tighter">P&L Manifest</span>
              </div>
              <FileText size={16} className="text-muted group-hover:text-primary transition-colors" />
            </button>
          </div>
        </Panel>

        <Panel 
          title="Liquidity Trend" 
          subtitle="Time-series analysis of operational capital flow."
          className="lg:col-span-2"
        >
          <div className="h-48 flex items-center justify-center border border-dashed border-border rounded-xl bg-surface-muted/30">
            <div className="text-center opacity-40">
              <ArrowUpRight size={32} className="mx-auto mb-2" />
              <p className="text-[10px] font-bold text-muted uppercase tracking-widest">Cashflow Visualization coming soon</p>
            </div>
          </div>
        </Panel>
      </div>
    </div>
  );
};

export default AccountantDashboard;
