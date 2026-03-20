import { createSlice } from '@reduxjs/toolkit';
import { getStoredTheme } from '../utils/theme';

const initialState = {
  theme: getStoredTheme(),
  settings: null,
  notifications: [],
  unreadCount: 0,
  sidebarOpen: false,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setTheme: (state, action) => {
      state.theme = action.payload;
    },
    toggleTheme: (state) => {
      state.theme = state.theme === 'light' ? 'dark' : 'light';
    },
    setSettings: (state, action) => {
      state.settings = action.payload;
    },
    setNotifications: (state, action) => {
      state.notifications = action.payload.items || [];
      state.unreadCount = action.payload.unreadCount || 0;
    },
    prependNotification: (state, action) => {
      state.notifications = [action.payload, ...state.notifications].slice(0, 10);
      state.unreadCount += 1;
    },
    markNotificationReadStore: (state, action) => {
      state.notifications = state.notifications.map((item) =>
        item._id === action.payload ? { ...item, readBy: [...(item.readBy || []), 'me'] } : item,
      );
      state.unreadCount = Math.max(0, state.unreadCount - 1);
    },
    setSidebarOpen: (state, action) => {
      state.sidebarOpen = action.payload;
    },
  },
});

export const {
  setTheme,
  toggleTheme,
  setSettings,
  setNotifications,
  prependNotification,
  markNotificationReadStore,
  setSidebarOpen,
} = uiSlice.actions;

export default uiSlice.reducer;

