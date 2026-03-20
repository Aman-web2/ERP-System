import { Clock, CheckSquare, Calendar, Bell } from 'lucide-react';
import { Link } from 'react-router-dom';

const EmployeeDashboard = () => {
  const statCards = [
    { title: 'My Active Tasks', value: 4, icon: <CheckSquare size={24} className="text-indigo-500" />, bg: 'bg-indigo-50' },
    { title: 'My Pending Leaves', value: 1, icon: <Calendar size={24} className="text-orange-500" />, bg: 'bg-orange-50' },
    { title: 'Hours Worked (Week)', value: '32h', icon: <Clock size={24} className="text-emerald-500" />, bg: 'bg-emerald-50' },
    { title: 'New Announcements', value: 2, icon: <Bell size={24} className="text-blue-500" />, bg: 'bg-blue-50' },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Employee Hub</h1>
        <button className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 rounded-lg font-medium shadow-sm transition-colors flex items-center gap-2">
          <Clock size={18} /> Clock In
        </button>
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
          <h2 className="text-lg font-semibold text-gray-900 mb-4">My Actions</h2>
          <div className="grid grid-cols-2 gap-4">
            <Link to="/tasks" className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors flex flex-col items-center justify-center gap-2 text-indigo-600 font-medium">
              <CheckSquare size={24} /> View My Tasks
            </Link>
            <Link to="/leaves" className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors flex flex-col items-center justify-center gap-2 text-orange-600 font-medium">
              <Calendar size={24} /> Apply for Leave
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeDashboard;

