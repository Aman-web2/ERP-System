import { useEffect, useMemo, useState } from 'react';
import { io } from 'socket.io-client';
import { Bell, LogOut, Menu, Moon, Search, SunMedium } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  markNotificationReadStore,
  prependNotification,
  setNotifications,
  setSidebarOpen,
  toggleTheme,
} from '../../store/uiSlice';
import { logoutUserStore } from '../../store/authSlice';
import useDebounce from '../../hooks/useDebounce';
import api from '../../utils/axiosInstance';
import { formatShortDate } from '../../utils/formatters';
import { applyTheme } from '../../utils/theme';

const Navbar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { userInfo } = useSelector((state) => state.auth);
  const { notifications, unreadCount, theme } = useSelector((state) => state.ui);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const debouncedSearch = useDebounce(searchTerm, 300);

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const { data } = await api.get('/notifications?limit=10');
        dispatch(setNotifications(data));
      } catch (error) {
        console.error(error);
      }
    };

    fetchNotifications();
  }, [dispatch]);

  useEffect(() => {
    const socket = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000');
    socket.on('notification:new', (payload) => {
      dispatch(prependNotification(payload));
    });

    return () => {
      socket.disconnect();
    };
  }, [dispatch]);

  useEffect(() => {
    if (!debouncedSearch) {
      setSearchResults(null);
      return;
    }

    const search = async () => {
      try {
        const { data } = await api.get(`/search?q=${encodeURIComponent(debouncedSearch)}`);
        setSearchResults(data);
      } catch (error) {
        console.error(error);
      }
    };

    search();
  }, [debouncedSearch]);

  const flatResults = useMemo(() => {
    if (!searchResults) return [];
    return [
      ...(searchResults.employees || []).map((item) => ({ label: item.name, meta: item.email, route: '/employees' })),
      ...(searchResults.products || []).map((item) => ({ label: item.name, meta: item.sku, route: '/inventory' })),
      ...(searchResults.customers || []).map((item) => ({ label: item.name, meta: item.company, route: '/crm' })),
      ...(searchResults.tasks || []).map((item) => ({ label: item.title, meta: item.status, route: '/tasks' })),
    ].slice(0, 8);
  }, [searchResults]);

  const logoutHandler = async () => {
    await api.post('/auth/logout');
    dispatch(logoutUserStore());
    navigate('/login');
  };

  const markRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      dispatch(markNotificationReadStore(id));
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <header className="sticky top-0 z-20 border-b border-border bg-surface px-4 h-16 flex items-center sm:px-6 lg:px-8 shadow-sm">
      <div className="mx-auto flex w-full max-w-[1600px] items-center justify-between gap-4">
        <div className="flex items-center gap-4 flex-1">
          <button className="p-2 border border-border rounded-lg text-muted hover:bg-surface-muted lg:hidden" onClick={() => dispatch(setSidebarOpen(true))}>
            <Menu size={20} />
          </button>
          
          <div className="relative w-full max-w-sm group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted group-focus-within:text-primary transition-colors" size={16} />
            <input
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              className="pl-10 h-10 text-sm focus:ring-2 focus:ring-primary/20"
              placeholder="Search anything..."
            />
            <AnimatePresence>
              {flatResults.length ? (
                <motion.div 
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  className="absolute left-0 right-0 top-full mt-2 z-50 p-1 bg-surface border border-border rounded-xl shadow-xl"
                >
                  {flatResults.map((result) => (
                    <button
                      key={`${result.route}-${result.label}`}
                      type="button"
                      className="w-full rounded-lg px-3 py-2 text-left hover:bg-surface-muted transition-colors flex flex-col"
                      onClick={() => {
                        navigate(result.route);
                        setSearchTerm('');
                        setSearchResults(null);
                      }}
                    >
                      <span className="text-sm font-semibold text-text">{result.label}</span>
                      <span className="text-xs text-muted">{result.meta}</span>
                    </button>
                  ))}
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button className="p-2 text-muted hover:bg-surface-muted rounded-lg transition-colors" onClick={() => dispatch(toggleTheme())}>
            {theme === 'light' ? <Moon size={20} /> : <SunMedium size={20} className="text-amber-500" />}
          </button>

          <div className="relative">
            <button className="p-2 text-muted hover:bg-surface-muted rounded-lg transition-colors relative" onClick={() => setNotificationOpen((current) => !current)}>
              <Bell size={20} />
              {unreadCount ? (
                <span className="absolute top-1 right-1 h-4 w-4 bg-primary text-[10px] font-bold text-white flex items-center justify-center rounded-full ring-2 ring-surface">
                  {unreadCount}
                </span>
              ) : null}
            </button>
            <AnimatePresence>
              {notificationOpen && (
                <motion.div 
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute right-0 top-full mt-2 z-50 w-80 bg-surface border border-border rounded-xl shadow-2xl overflow-hidden"
                >
                  <div className="p-4 border-b border-border flex items-center justify-between bg-surface-muted/50">
                    <h3 className="font-bold text-text">Notifications</h3>
                    {unreadCount > 0 && <span className="text-[10px] font-bold bg-primary/10 text-primary px-2 py-0.5 rounded-full">{unreadCount} New</span>}
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {notifications.length ? notifications.map((item) => (
                      <button
                        key={item._id}
                        type="button"
                        className="w-full p-4 text-left border-b border-border last:border-0 hover:bg-surface-muted transition-colors"
                        onClick={() => markRead(item._id)}
                      >
                        <div className="flex justify-between items-start gap-2">
                          <p className="text-sm font-semibold text-text leading-tight">{item.title}</p>
                          <span className="text-[10px] text-muted whitespace-nowrap">{formatShortDate(item.createdAt)}</span>
                        </div>
                        <p className="mt-1 text-xs text-muted line-clamp-2">{item.message}</p>
                      </button>
                    )) : (
                      <div className="p-8 text-center">
                        <p className="text-sm text-muted">No new notifications</p>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="h-6 w-px bg-border mx-2" />

          <div className="flex items-center gap-3">
            <div className="flex flex-col items-end text-right hidden sm:flex">
              <p className="text-sm font-semibold text-text leading-none">{userInfo?.name}</p>
              <p className="text-[11px] font-medium text-primary mt-1">{userInfo?.role}</p>
            </div>
            <div className="h-9 w-9 rounded-full bg-surface-muted border border-border flex items-center justify-center text-xs font-bold text-muted hover:border-primary/30 transition-colors cursor-pointer">
              {userInfo?.name?.split(' ').map(n => n[0]).join('')}
            </div>
          </div>

          <button className="p-2 text-muted hover:text-danger hover:bg-danger-soft rounded-lg transition-colors ml-1" onClick={logoutHandler} title="Logout">
            <LogOut size={20} />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;

