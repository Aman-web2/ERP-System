import { useEffect, useState, useRef } from 'react';
import { useSelector } from 'react-redux';
import { gsap } from 'gsap';
import api from '../../utils/axiosInstance';
import LoadingState from '../../components/ui/LoadingState';

// Role-specific dashboards
import AdminDashboard from './AdminDashboard';
import HRDashboard from './HRDashboard';
import AccountantDashboard from './AccountantDashboard';
import SalesDashboard from './SalesDashboard';
import EmployeeDashboard from './EmployeeDashboard';

const Dashboard = () => {
  const { userInfo } = useSelector((state) => state.auth);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const dashboardRef = useRef(null);

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

  useEffect(() => {
    if (!loading && data && dashboardRef.current) {
      gsap.fromTo(
        dashboardRef.current.children,
        { opacity: 0, y: 30, scale: 0.95 },
        { 
          opacity: 1, 
          y: 0, 
          scale: 1, 
          duration: 0.8, 
          stagger: 0.15, 
          ease: 'expo.out',
          clearProps: 'all'
        }
      );
    }
  }, [loading, data]);

  if (loading) {
    return <LoadingState label="Synchronizing operational intelligence..." />;
  }

  // Determine which dashboard to render based on user role
  const renderDashboard = () => {
    switch (userInfo?.role) {
      case 'Admin':
        return <AdminDashboard data={data} />;
      case 'HR':
        return <HRDashboard data={data} />;
      case 'Accountant':
        return <AccountantDashboard data={data} />;
      case 'Sales':
        return <SalesDashboard data={data} />;
      case 'Employee':
      default:
        return <EmployeeDashboard data={data} />;
    }
  };

  return (
    <div ref={dashboardRef} className="relative pb-20">
      {/* Interactive Background Stickers / Blobs */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-3xl rounded-full -z-10 animate-pulse" />
      <div className="absolute bottom-40 left-0 w-96 h-96 bg-indigo-500/5 blur-3xl rounded-full -z-10 animate-bounce" style={{ animationDuration: '10s' }} />
      
      {renderDashboard()}
    </div>
  );
};

export default Dashboard;
