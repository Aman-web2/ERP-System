import { useEffect, useMemo, useState } from 'react';
import { io } from 'socket.io-client';
import { Bell, LogOut, Menu, Moon, Search, SunMedium } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
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
    <header className="sticky top-0 z-20 border-b border-[var(--border)] bg-[rgba(255,255,255,0.55)] px-4 py-4 backdrop-blur-xl sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-[1600px] flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-3">
          <button className="secondary-button px-3 py-2 lg:hidden" onClick={() => dispatch(setSidebarOpen(true))}>
            <Menu size={18} />
          </button>
          <div className="relative w-full max-w-xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--muted)]" size={18} />
            <input
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              className="pl-11"
              placeholder="Search employees, customers, products, tasks"
            />
            {flatResults.length ? (
              <div className="panel absolute left-0 right-0 top-[calc(100%+0.75rem)] z-20 p-2">
                {flatResults.map((result) => (
                  <button
                    key={`${result.route}-${result.label}`}
                    type="button"
                    className="w-full rounded-2xl px-4 py-3 text-left hover:bg-[var(--surface-muted)]"
                    onClick={() => {
                      navigate(result.route);
                      setSearchTerm('');
                      setSearchResults(null);
                    }}
                  >
                    <p className="font-medium text-[var(--text)]">{result.label}</p>
                    <p className="text-sm text-[var(--muted)]">{result.meta}</p>
                  </button>
                ))}
              </div>
            ) : null}
          </div>
        </div>

        <div className="flex items-center justify-end gap-3">
          <button className="secondary-button px-3 py-2" onClick={() => dispatch(toggleTheme())}>
            {theme === 'light' ? <Moon size={18} /> : <SunMedium size={18} />}
          </button>

          <div className="relative">
            <button className="secondary-button relative px-3 py-2" onClick={() => setNotificationOpen((current) => !current)}>
              <Bell size={18} />
              {unreadCount ? <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-[var(--accent)] text-[10px] font-semibold text-white">{unreadCount}</span> : null}
            </button>
            {notificationOpen ? (
              <div className="panel absolute right-0 top-[calc(100%+0.75rem)] z-30 w-[360px] p-3">
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="font-semibold text-[var(--text)]">Notifications</h3>
                  <span className="text-xs text-[var(--muted)]">{unreadCount} unread</span>
                </div>
                <div className="space-y-2">
                  {notifications.length ? notifications.map((item) => (
                    <button
                      key={item._id}
                      type="button"
                      className="w-full rounded-2xl border border-[var(--border)] px-4 py-3 text-left hover:bg-[var(--surface-muted)]"
                      onClick={() => markRead(item._id)}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <p className="font-medium text-[var(--text)]">{item.title}</p>
                        <span className="text-xs text-[var(--muted)]">{formatShortDate(item.createdAt)}</span>
                      </div>
                      <p className="mt-1 text-sm text-[var(--muted)]">{item.message}</p>
                    </button>
                  )) : <p className="px-3 py-6 text-center text-sm text-[var(--muted)]">No notifications yet.</p>}
                </div>
              </div>
            ) : null}
          </div>

          <div className="rounded-full border border-[var(--border)] bg-[var(--surface)] px-4 py-2">
            <p className="text-sm font-semibold text-[var(--text)]">{userInfo?.name}</p>
            <p className="text-xs text-[var(--muted)]">{userInfo?.role}</p>
          </div>

          <button className="danger-button px-3 py-2" onClick={logoutHandler}>
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;

