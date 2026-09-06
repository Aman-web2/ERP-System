import { useEffect, useRef } from 'react';
import { NavLink } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import gsap from 'gsap';
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
  Activity,
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
  { label: 'Activity Logs', path: '/audit-logs', icon: Activity, module: 'settings' },
];

const Sidebar = () => {
  const dispatch = useDispatch();
  const menuRef = useRef(null);
  const { userInfo } = useSelector((state) => state.auth);
  const { sidebarOpen } = useSelector((state) => state.ui);
  const visibleItems = navItems.filter((item) => canAccess(userInfo, item.module));

  useEffect(() => {
    if (menuRef.current) {
      const items = menuRef.current.querySelectorAll('.nav-item');
      gsap.fromTo(items, 
        { opacity: 0, x: -20 }, 
        { opacity: 1, x: 0, stagger: 0.05, duration: 0.6, ease: 'power2.out', delay: 0.2 }
      );
    }
  }, []);

  return (
    <>
      <div className={`fixed inset-0 z-30 bg-slate-950/40 lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`} onClick={() => dispatch(setSidebarOpen(false))} />
      <aside className={`fixed left-0 top-0 z-40 h-full w-[260px] border-r border-[#1e293b] bg-[#0f172a] text-slate-400 transition-transform duration-300 lg:sticky lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex h-16 items-center px-6 border-b border-[#1e293b]">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center text-white font-bold">B</div>
            <h2 className="text-lg font-bold tracking-tight text-white">BizeeERP</h2>
          </div>
          <button className="ml-auto p-2 text-slate-400 hover:text-white lg:hidden" onClick={() => dispatch(setSidebarOpen(false))}>
            <X size={20} />
          </button>
        </div>

        <div className="px-4 py-6">
          <div className="mb-8 px-2">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 mb-4">Main Menu</p>
            <nav className="space-y-1">
              {visibleItems.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={() => dispatch(setSidebarOpen(false))}
                    className={({ isActive }) =>
                      `flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200 ${
                        isActive 
                        ? 'bg-primary text-white shadow-lg shadow-primary/20' 
                        : 'hover:bg-[#1e293b] hover:text-white'
                      }`
                    }
                  >
                    <Icon size={18} strokeWidth={2} />
                    <span>{item.label}</span>
                  </NavLink>
                );
              })}
            </nav>
          </div>

          <div className="mt-auto px-2 pt-6 border-t border-[#1e293b]">
            <div className="rounded-xl bg-[#1e293b] p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-slate-700 flex items-center justify-center text-slate-300 font-bold uppercase transition-transform hover:scale-110">
                  {userInfo?.name?.charAt(0) || 'U'}
                </div>
                <div className="flex-1 overflow-hidden">
                  <p className="text-sm font-semibold text-white truncate">{userInfo?.name}</p>
                  <p className="text-xs text-slate-400 truncate">{userInfo?.role}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;

