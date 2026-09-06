import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import Home from './pages/Home';
import { AnimatePresence, motion } from 'framer-motion';
import MainLayout from './components/Layout/MainLayout';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import ForgotPassword from './pages/Auth/ForgotPassword';
import CompleteProfile from './pages/Auth/CompleteProfile';
import PendingApproval from './pages/Auth/PendingApproval';
import Dashboard from './pages/Dashboard/Dashboard';
import EmployeeList from './pages/Employees/EmployeeList';
import LeaveManagement from './pages/Employees/LeaveManagement';
import InventoryList from './pages/Inventory/InventoryList';
import CustomerList from './pages/CRM/CustomerList';
import OrderList from './pages/Sales/OrderList';
import FinanceDashboard from './pages/Finance/FinanceDashboard';
import TaskManager from './pages/Tasks/TaskManager';
import DocumentManager from './pages/Documents/DocumentManager';
import Reports from './pages/Reports/Reports';
import Settings from './pages/Settings/Settings';
import AuditLogList from './pages/Audit/AuditLogList';

const PageTransition = ({ children }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -10 }}
    transition={{ duration: 0.3, ease: 'easeOut' }}
  >
    {children}
  </motion.div>
);

function App() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<PageTransition><Home /></PageTransition>} />
        <Route path="/login" element={<PageTransition><Login /></PageTransition>} />
        <Route path="/register" element={<PageTransition><Register /></PageTransition>} />
        <Route path="/forgot-password" element={<PageTransition><ForgotPassword /></PageTransition>} />

        <Route element={<ProtectedRoute />}>
          <Route path="/complete-profile" element={<PageTransition><CompleteProfile /></PageTransition>} />
          <Route path="/pending-approval" element={<PageTransition><PendingApproval /></PageTransition>} />

          <Route element={<MainLayout />}>
            <Route path="/dashboard" element={<PageTransition><Dashboard /></PageTransition>} />

            <Route element={<ProtectedRoute moduleKey="employees" />}>
              <Route path="/employees" element={<PageTransition><EmployeeList /></PageTransition>} />
            </Route>
            <Route element={<ProtectedRoute moduleKey="leaves" />}>
              <Route path="/leaves" element={<PageTransition><LeaveManagement /></PageTransition>} />
            </Route>
            <Route element={<ProtectedRoute moduleKey="inventory" />}>
              <Route path="/inventory" element={<PageTransition><InventoryList /></PageTransition>} />
            </Route>
            <Route element={<ProtectedRoute moduleKey="crm" />}>
              <Route path="/crm" element={<PageTransition><CustomerList /></PageTransition>} />
            </Route>
            <Route element={<ProtectedRoute moduleKey="sales" />}>
              <Route path="/sales" element={<PageTransition><OrderList /></PageTransition>} />
            </Route>
            <Route element={<ProtectedRoute moduleKey="finance" />}>
              <Route path="/finance" element={<PageTransition><FinanceDashboard /></PageTransition>} />
            </Route>
            <Route element={<ProtectedRoute moduleKey="tasks" />}>
              <Route path="/tasks" element={<PageTransition><TaskManager /></PageTransition>} />
            </Route>

            <Route element={<ProtectedRoute moduleKey="documents" />}>
              <Route path="/documents" element={<PageTransition><DocumentManager /></PageTransition>} />
            </Route>
            <Route element={<ProtectedRoute moduleKey="reports" />}>
              <Route path="/reports" element={<PageTransition><Reports /></PageTransition>} />
            </Route>
            <Route element={<ProtectedRoute moduleKey="settings" />}>
              <Route path="/settings" element={<PageTransition><Settings /></PageTransition>} />
              <Route path="/audit-logs" element={<PageTransition><AuditLogList /></PageTransition>} />
            </Route>
          </Route>
        </Route>
      </Routes>
    </AnimatePresence>
  );
}

export default App;

