import { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { setCredentials } from '../../store/authSlice';
import { setSettings, setTheme } from '../../store/uiSlice';
import { applyTheme } from '../../utils/theme';
import api from '../../utils/axiosInstance';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

const MainLayout = () => {
  const dispatch = useDispatch();
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
    <div className="min-h-screen lg:grid lg:grid-cols-[280px_1fr]">
      <Sidebar />
      <div className="min-h-screen">
        <Navbar />
        <main className="px-4 pb-8 pt-6 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-[1600px] space-y-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default MainLayout;

