export const applyTheme = (theme) => {
  document.documentElement.dataset.theme = theme;
  localStorage.setItem('erp_theme', theme);
};

export const getStoredTheme = () => localStorage.getItem('erp_theme') || 'light';

