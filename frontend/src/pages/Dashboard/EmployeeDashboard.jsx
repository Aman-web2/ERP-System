import { Clock, CheckSquare, Calendar, Bell, ArrowUpRight, CheckCircle2, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import PageHeader from '../../components/ui/PageHeader';
import MetricCard from '../../components/ui/MetricCard';
import Panel from '../../components/ui/Panel';

const EmployeeDashboard = ({ data }) => {
  const statCards = [
    { title: 'My Active Tasks', value: data?.stats?.pendingTasks || 0, icon: <CheckSquare size={20} />, tone: 'primary' },
    { title: 'My Pending Leaves', value: data?.alerts?.pendingLeaves?.length || 0, icon: <Calendar size={20} />, tone: 'warning' },
    { title: 'Hours Worked (Week)', value: '32h', icon: <Clock size={20} />, tone: 'success' },
    { title: 'New Announcements', value: data?.stats?.notifications || 0, icon: <Bell size={20} />, tone: 'primary' },
  ];

  return (
    <div className="space-y-6 pb-12">
      <PageHeader 
        title="Personal Workspace" 
        description="Your individual performance metrics, schedule synchronization, and task pipeline."
        actions={
          <button className="primary-button h-11 px-8 text-[11px] font-bold uppercase tracking-widest flex items-center gap-2 group">
            <Clock size={18} /> System Clock In
          </button>
        }
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
           title="Immediate Actions" 
           subtitle="Quick access to primary operational modules."
           className="lg:col-span-1"
         >
          <div className="grid grid-cols-1 gap-3">
            <Link to="/tasks" className="p-4 rounded-xl border border-border bg-surface hover:border-primary/20 hover:bg-primary/5 transition-all flex items-center justify-between group">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                  <CheckSquare size={20} />
                </div>
                <span className="text-sm font-bold text-text uppercase tracking-tighter">My Task Queue</span>
              </div>
              <ArrowUpRight size={16} className="text-muted group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </Link>
            <Link to="/leaves" className="p-4 rounded-xl border border-border bg-surface hover:border-warning/20 hover:bg-warning/5 transition-all flex items-center justify-between group">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-warning/10 text-warning flex items-center justify-center">
                  <Calendar size={20} />
                </div>
                <span className="text-sm font-bold text-text uppercase tracking-tighter">Leave Management</span>
              </div>
              <ArrowUpRight size={16} className="text-muted group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </Link>
          </div>
        </Panel>

        <Panel 
          title="Performance Synchronization" 
          subtitle="Recent system notifications and individual milestones."
          className="lg:col-span-2"
        >
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-surface-muted/30 border border-dashed border-border flex items-center gap-4">
              <div className="h-10 w-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center border border-emerald-200">
                <CheckCircle2 size={20} />
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-text uppercase tracking-tighter">Onboarding Phase Complete</p>
                <p className="text-[10px] font-bold text-muted uppercase mt-0.5 tracking-widest">System updated 2 hours ago</p>
              </div>
            </div>
            <div className="p-4 rounded-xl bg-surface-muted/30 border border-dashed border-border flex items-center gap-4 opacity-60">
              <div className="h-10 w-10 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center border border-amber-200">
                <AlertCircle size={20} />
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-text uppercase tracking-tighter">Compliance Review Pending</p>
                <p className="text-[10px] font-bold text-muted uppercase mt-0.5 tracking-widest">Awaiting department verification</p>
              </div>
            </div>
          </div>
        </Panel>
      </div>
    </div>
  );
};

export default EmployeeDashboard;
