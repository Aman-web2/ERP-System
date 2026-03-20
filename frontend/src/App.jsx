import { Navigate, Route, Routes } from 'react-router-dom';
import MainLayout from './components/Layout/MainLayout';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import ForgotPassword from './pages/Auth/ForgotPassword';
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

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<MainLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />

          <Route element={<ProtectedRoute moduleKey="employees" />}>
            <Route path="/employees" element={<EmployeeList />} />
          </Route>
          <Route element={<ProtectedRoute moduleKey="leaves" />}>
            <Route path="/leaves" element={<LeaveManagement />} />
          </Route>
          <Route element={<ProtectedRoute moduleKey="inventory" />}>
            <Route path="/inventory" element={<InventoryList />} />
          </Route>
          <Route element={<ProtectedRoute moduleKey="crm" />}>
            <Route path="/crm" element={<CustomerList />} />
          </Route>
          <Route element={<ProtectedRoute moduleKey="sales" />}>
            <Route path="/sales" element={<OrderList />} />
          </Route>
          <Route element={<ProtectedRoute moduleKey="finance" />}>
            <Route path="/finance" element={<FinanceDashboard />} />
          </Route>
          <Route element={<ProtectedRoute moduleKey="tasks" />}>
            <Route path="/tasks" element={<TaskManager />} />
          </Route>
          <Route element={<ProtectedRoute moduleKey="documents" />}>
            <Route path="/documents" element={<DocumentManager />} />
          </Route>
          <Route element={<ProtectedRoute moduleKey="reports" />}>
            <Route path="/reports" element={<Reports />} />
          </Route>
          <Route element={<ProtectedRoute moduleKey="settings" />}>
            <Route path="/settings" element={<Settings />} />
          </Route>
        </Route>
      </Route>
    </Routes>
  );
}

export default App;

