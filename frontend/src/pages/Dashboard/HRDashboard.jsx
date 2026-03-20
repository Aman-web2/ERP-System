import { Users, UserCheck, Calendar, Bell } from 'lucide-react';
import { Link } from 'react-router-dom';

const HRDashboard = () => {
  const statCards = [
    { title: 'Total Employees', value: 124, icon: <Users size={24} className="text-blue-500" />, bg: 'bg-blue-50' },
    { title: 'Present Today', value: 112, icon: <UserCheck size={24} className="text-emerald-500" />, bg: 'bg-emerald-50' },
    { title: 'On Leave', value: 12, icon: <Calendar size={24} className="text-orange-500" />, bg: 'bg-orange-50' },
    { title: 'Pending Leave Approvals', value: 5, icon: <Bell size={24} className="text-red-500" />, bg: 'bg-red-50' },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">HR Dashboard</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, idx) => (
          <div key={idx} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col justify-between hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">{card.title}</p>
                <h3 className="text-3xl font-bold text-gray-900">{card.value}</h3>
              </div>
              <div className={`p-3 rounded-xl ${card.bg}`}>{card.icon}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-4">
            <Link to="/employees" className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors flex flex-col items-center justify-center gap-2 text-indigo-600 font-medium">
              <Users size={24} /> Register New Employee
            </Link>
            <Link to="/leaves" className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors flex flex-col items-center justify-center gap-2 text-orange-600 font-medium">
              <Bell size={24} /> Review Leaves
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HRDashboard;

