import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { setCredentials } from '../../store/authSlice';
import { setSettings, setTheme } from '../../store/uiSlice';
import { applyTheme } from '../../utils/theme';
import api from '../../utils/axiosInstance';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

const MainLayout = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const { userInfo } = useSelector((state) => state.auth);
  const { theme } = useSelector((state) => state.ui);

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  useEffect(() => {
    const bootstrap = async () => {
      try {
        const [profileResponse, settingsResponse] = await Promise.all([
          api.get('/auth/profile'),
          api.get('/settings'),
        ]);
        dispatch(setCredentials(profileResponse.data));
        dispatch(setSettings(settingsResponse.data));
        if (settingsResponse.data?.theme) {
          dispatch(setTheme(settingsResponse.data.theme));
        }
      } catch (error) {
        if (userInfo?.permissions) return;
      }
    };

    bootstrap();
  }, [dispatch]);

  return (
    <div className="relative min-h-screen lg:grid lg:grid-cols-[260px_1fr] bg-bg overflow-hidden">
      {/* Premium Background Flair */}
      <div className="bg-blob-container">
        <div className="premium-blob bg-primary/20 -top-24 -left-24" />
        <div className="premium-blob bg-blue-400/10 top-1/2 -right-48" style={{ animationDelay: '-5s' }} />
        <div className="premium-blob bg-indigo-500/10 -bottom-48 left-1/4" style={{ animationDelay: '-12s' }} />
        
        {/* Decorative Floating Stickers */}
        <div className="absolute top-[10%] left-[15%] opacity-20 animate-bounce" style={{ animationDuration: '8s' }}>
          <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="20" cy="20" r="15" stroke="var(--primary)" strokeWidth="2" strokeDasharray="4 4" />
          </svg>
        </div>
        <div className="absolute bottom-[20%] right-[10%] opacity-20 animate-pulse" style={{ animationDuration: '12s' }}>
          <svg width="60" height="60" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="10" y="10" width="40" height="40" rx="8" stroke="var(--primary)" strokeWidth="2" transform="rotate(15 30 30)" />
          </svg>
        </div>
        <div className="absolute top-[40%] right-[25%] opacity-10 animate-bounce" style={{ animationDuration: '6s' }}>
          <svg width="30" height="30" viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M15 5L25 25H5L15 5Z" stroke="var(--primary)" strokeWidth="2" />
          </svg>
        </div>
      </div>

      <Sidebar />
      <div className="relative z-10 min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 px-4 py-10 sm:px-8 lg:px-12 overflow-x-hidden">
          <div className="mx-auto max-w-[1600px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={location.pathname}
                initial={{ opacity: 0, scale: 0.99, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 1.01, y: -10 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              >
                <Outlet />
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>
    </div>
  );
};

export default MainLayout;

