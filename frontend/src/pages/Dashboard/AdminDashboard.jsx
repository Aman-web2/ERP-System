import { useState, useEffect } from 'react';
import api from '../../utils/axiosInstance';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Users, DollarSign, ListTodo, ShoppingBag, TrendingUp, Clock } from 'lucide-react';

const AdminDashboard = () => {
  const [data, setData] = useState({ stats: null, revenueData: [], recentActivities: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const response = await api.get('/dashboard/summary');
        setData(response.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) {
    return <div className="flex h-full items-center justify-center text-gray-400">Loading Dashboard...</div>;
  }

  const { stats, revenueData, recentActivities } = data;

  const statCards = [
    { title: 'Total Revenue', value: `$${stats?.totalRevenue?.toLocaleString() || '0'}`, icon: <DollarSign size={24} className="text-emerald-500" />, bg: 'bg-emerald-50' },
    { title: 'Total Employees', value: stats?.totalEmployees || 0, icon: <Users size={24} className="text-blue-500" />, bg: 'bg-blue-50' },
    { title: 'Pending Tasks', value: stats?.pendingTasks || 0, icon: <ListTodo size={24} className="text-orange-500" />, bg: 'bg-orange-50' },
    { title: 'Total Orders', value: stats?.totalOrders || 0, icon: <ShoppingBag size={24} className="text-indigo-500" />, bg: 'bg-indigo-50' },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Admin Overview</h1>
        <div className="flex items-center gap-2 text-sm text-gray-500 bg-white px-3 py-1.5 rounded-lg border border-gray-200">
          <TrendingUp size={16} />
          <span>Last 7 months</span>
        </div>
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
            <div className="mt-4 flex items-center text-sm">
              <span className="text-emerald-600 font-medium flex items-center">+12% <TrendingUp size={14} className="ml-1" /></span>
              <span className="text-gray-400 ml-2">from last month</span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Revenue Analytics</h2>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dx={-10} tickFormatter={(val) => `$${val/1000}k`} />
                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} formatter={(value) => [`$${value}`, 'Revenue']} />
                <Area type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h2>
          <div className="space-y-6">
            {recentActivities.map((activity, idx) => (
              <div key={idx} className="flex gap-4 relative">
                {idx !== recentActivities.length - 1 && <div className="absolute top-8 bottom-0 left-[11px] w-px bg-gray-200"></div>}
                <div className="flex-shrink-0 z-10 w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center border-4 border-white shadow-sm">
                  <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
                </div>
                <div className="flex-1 pb-1">
                  <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                  <div className="flex items-center text-xs text-gray-500 mt-1">
                    <span className="font-medium mr-2">{activity.user}</span>
                    <Clock size={12} className="mr-1" /> {activity.time}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <button className="w-full mt-6 py-2 text-sm font-medium text-indigo-600 border border-indigo-100 rounded-lg hover:bg-indigo-50 transition-colors">
            View All Activity
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;

