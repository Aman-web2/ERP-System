export const MODULE_LABELS = {
  dashboard: 'Dashboard',
  employees: 'HR',
  leaves: 'Leave & Attendance',
  attendance: 'Attendance',
  inventory: 'Inventory',
  crm: 'CRM',
  sales: 'Sales',
  finance: 'Finance',
  tasks: 'Tasks',
  documents: 'Documents',
  notifications: 'Notifications',
  reports: 'Reports',
  settings: 'Settings',
};

export const canAccess = (user, moduleKey) => {
  if (!user) return false;
  if (user.role === 'Admin') return true;
  return (user.permissions || []).includes(moduleKey);
};

