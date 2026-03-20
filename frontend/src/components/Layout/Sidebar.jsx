import { NavLink } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  LayoutDashboard,
  Users,
  CalendarCheck,
  Boxes,
  Handshake,
  ShoppingCart,
  Wallet,
  ListTodo,
  FolderKanban,
  FileText,
  Settings,
  ChartSpline,
  X,
} from 'lucide-react';
import { setSidebarOpen } from '../../store/uiSlice';
import { canAccess } from '../../utils/permissions';

const navItems = [
  { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, module: 'dashboard' },
  { label: 'HR Workspace', path: '/employees', icon: Users, module: 'employees' },
  { label: 'Leaves & Attendance', path: '/leaves', icon: CalendarCheck, module: 'leaves' },
  { label: 'Inventory', path: '/inventory', icon: Boxes, module: 'inventory' },
  { label: 'CRM', path: '/crm', icon: Handshake, module: 'crm' },
  { label: 'Sales & Orders', path: '/sales', icon: ShoppingCart, module: 'sales' },
  { label: 'Finance', path: '/finance', icon: Wallet, module: 'finance' },
  { label: 'Tasks', path: '/tasks', icon: ListTodo, module: 'tasks' },
  { label: 'Documents', path: '/documents', icon: FolderKanban, module: 'documents' },
  { label: 'Reports', path: '/reports', icon: ChartSpline, module: 'reports' },
  { label: 'Settings', path: '/settings', icon: Settings, module: 'settings' },
];

const Sidebar = () => {
  const dispatch = useDispatch();
  const { userInfo } = useSelector((state) => state.auth);
  const { sidebarOpen } = useSelector((state) => state.ui);
  const visibleItems = navItems.filter((item) => canAccess(userInfo, item.module));

  return (
    <>
      <div className={`fixed inset-0 z-30 bg-slate-950/40 backdrop-blur-sm lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`} onClick={() => dispatch(setSidebarOpen(false))} />
      <aside className={`fixed left-0 top-0 z-40 h-full w-[280px] border-r border-[var(--border)] bg-[var(--surface)] p-5 shadow-2xl backdrop-blur-xl transition-transform duration-300 lg:sticky lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center justify-between">
          <div>
            <p className="eyebrow">Scale ERP</p>
            <h2 className="mt-2 text-2xl font-semibold text-[var(--text)]">Operations Core</h2>
          </div>
          <button className="ghost-button px-3 py-2 lg:hidden" onClick={() => dispatch(setSidebarOpen(false))}>
            <X size={18} />
          </button>
        </div>

        <div className="mt-8 rounded-3xl border border-[var(--border)] bg-[var(--surface-muted)] p-4">
          <p className="text-xs uppercase tracking-[0.25em] text-[var(--muted)]">Active role</p>
          <p className="mt-2 text-lg font-semibold text-[var(--text)]">{userInfo?.role}</p>
          <p className="mt-1 text-sm text-[var(--muted)]">{userInfo?.name}</p>
        </div>

        <nav className="mt-8 space-y-2">
          {visibleItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => dispatch(setSidebarOpen(false))}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition ${isActive ? 'bg-[var(--surface-muted)] text-[var(--text)] shadow-sm' : 'text-[var(--muted)] hover:bg-[var(--surface-muted)] hover:text-[var(--text)]'}`
                }
              >
                <Icon size={18} />
                {item.label}
              </NavLink>
            );
          })}
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;

