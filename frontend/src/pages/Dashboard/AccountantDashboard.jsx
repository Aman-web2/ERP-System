import { DollarSign, FileText, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const AccountantDashboard = () => {
  const statCards = [
    { title: 'Cash Balance', value: '$124,500', icon: <DollarSign size={24} className="text-emerald-500" />, bg: 'bg-emerald-50' },
    { title: 'Pending Invoices', value: 12, icon: <FileText size={24} className="text-orange-500" />, bg: 'bg-orange-50' },
    { title: 'MTD Income', value: '$45,000', icon: <ArrowUpRight size={24} className="text-blue-500" />, bg: 'bg-blue-50' },
    { title: 'MTD Expenses', value: '$15,200', icon: <ArrowDownRight size={24} className="text-red-500" />, bg: 'bg-red-50' },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Finance Dashboard</h1>
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

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Finance Actions</h2>
        <div className="flex gap-4">
          <Link to="/finance" className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-indigo-700">Go To Ledger</Link>
          <button className="bg-white border border-gray-300 px-4 py-2 rounded-lg font-medium hover:bg-gray-50">Generate P&L Report</button>
        </div>
      </div>
    </div>
  );
};

export default AccountantDashboard;

