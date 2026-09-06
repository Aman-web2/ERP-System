import { Users, UserCheck, Calendar, Bell, UserPlus, FileText, ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import PageHeader from '../../components/ui/PageHeader';
import MetricCard from '../../components/ui/MetricCard';
import Panel from '../../components/ui/Panel';

const HRDashboard = ({ data }) => {
  const statCards = [
    { title: 'Total Employees', value: data?.stats?.totalEmployees || 0, icon: <Users size={20} />, tone: 'primary' },
    { title: 'Present Today', value: (data?.stats?.totalEmployees || 0) - (data?.stats?.onLeave || 0), icon: <UserCheck size={20} />, tone: 'success' },
    { title: 'On Leave', value: data?.stats?.onLeave || 0, icon: <Calendar size={20} />, tone: 'warning' },
    { title: 'Pending Leave Approvals', value: data?.alerts?.pendingLeaves?.length || 0, icon: <Bell size={20} />, tone: 'danger' },
  ];

  return (
    <div className="space-y-6 pb-12">
      <PageHeader 
        title="Human Capital Management" 
        description="Comprehensive workforce monitoring, attendance tracking, and administrative lifecycle control."
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
           title="Workforce Governance" 
           subtitle="Primary administrative actions for employee management."
           className="lg:col-span-1"
        >
          <div className="grid grid-cols-1 gap-3">
            <Link to="/employees" className="p-4 rounded-xl border border-border bg-surface hover:border-primary/20 hover:bg-primary/5 transition-all flex items-center justify-between group">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                  <UserPlus size={20} />
                </div>
                <span className="text-sm font-bold text-text uppercase tracking-tighter">Onboard Personnel</span>
              </div>
              <ArrowUpRight size={16} className="text-muted group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </Link>
            <Link to="/leaves" className="p-4 rounded-xl border border-border bg-surface hover:border-warning/20 hover:bg-warning/5 transition-all flex items-center justify-between group">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-warning/10 text-warning flex items-center justify-center">
                  <FileText size={20} />
                </div>
                <span className="text-sm font-bold text-text uppercase tracking-tighter">Review Absences</span>
              </div>
              <ArrowUpRight size={16} className="text-muted group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </Link>
          </div>
        </Panel>

        <Panel 
          title="Attendance Insights" 
          subtitle="Real-time verification of departmental presence."
          className="lg:col-span-2"
        >
          <div className="h-48 flex items-center justify-center border border-dashed border-border rounded-xl bg-surface-muted/30">
            <div className="text-center opacity-40">
              <Calendar size={32} className="mx-auto mb-2" />
              <p className="text-[10px] font-bold text-muted uppercase tracking-widest">Attendance Heatmap coming soon</p>
            </div>
          </div>
        </Panel>
      </div>
    </div>
  );
};

export default HRDashboard;
