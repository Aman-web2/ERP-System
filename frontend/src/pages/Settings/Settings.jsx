import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import api from '../../utils/axiosInstance';
import PageHeader from '../../components/ui/PageHeader';
import Panel from '../../components/ui/Panel';
import LoadingState from '../../components/ui/LoadingState';
import { MODULE_LABELS } from '../../utils/permissions';
import { setSettings, setTheme } from '../../store/uiSlice';

const roles = ['Admin', 'HR', 'Accountant', 'Employee'];

const Settings = () => {
  const dispatch = useDispatch();
  const { settings } = useSelector((state) => state.ui);
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (settings) {
      setForm(settings);
      return;
    }

    const fetchSettings = async () => {
      const { data } = await api.get('/settings');
      setForm(data);
      dispatch(setSettings(data));
    };

    fetchSettings();
  }, [settings, dispatch]);

  if (!form) {
    return <LoadingState label="Loading company settings..." />;
  }

  const togglePermission = (role, moduleKey) => {
    setForm((current) => {
      const permissions = current.permissions?.[role] || [];
      const nextPermissions = permissions.includes(moduleKey)
        ? permissions.filter((item) => item !== moduleKey)
        : [...permissions, moduleKey];

      return {
        ...current,
        permissions: {
          ...current.permissions,
          [role]: nextPermissions,
        },
      };
    });
  };

  const saveSettings = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      const payload = {
        companyName: form.companyName,
        email: form.email,
        phone: form.phone,
        website: form.website,
        address: form.address,
        currency: form.currency,
        taxId: form.taxId,
        theme: form.theme,
        permissions: form.permissions,
      };
      const { data } = await api.put('/settings', payload);
      dispatch(setSettings(data));
      dispatch(setTheme(data.theme));
      alert('Settings updated successfully');
    } catch (error) {
      alert(error?.response?.data?.message || 'Unable to save settings');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Company settings"
        description="Configure organization identity, workspace theme, and role-to-module access control."
      />

      <form className="space-y-6" onSubmit={saveSettings}>
        <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
          <Panel title="Company profile" subtitle="Base company settings used across the ERP.">
            <div className="field-grid two">
              <input value={form.companyName || ''} onChange={(event) => setForm((current) => ({ ...current, companyName: event.target.value }))} placeholder="Company name" required />
              <input type="email" value={form.email || ''} onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))} placeholder="Company email" required />
              <input value={form.phone || ''} onChange={(event) => setForm((current) => ({ ...current, phone: event.target.value }))} placeholder="Phone" required />
              <input value={form.website || ''} onChange={(event) => setForm((current) => ({ ...current, website: event.target.value }))} placeholder="Website" />
              <input value={form.currency || ''} onChange={(event) => setForm((current) => ({ ...current, currency: event.target.value }))} placeholder="Currency" required />
              <input value={form.taxId || ''} onChange={(event) => setForm((current) => ({ ...current, taxId: event.target.value }))} placeholder="Tax ID" />
              <textarea className="col-span-full" rows="4" value={form.address || ''} onChange={(event) => setForm((current) => ({ ...current, address: event.target.value }))} placeholder="Company address" required />
            </div>
          </Panel>

          <Panel title="Theme and permissions" subtitle="Apply workspace theme and control which modules each role can access.">
            <div className="space-y-5">
              <div>
                <p className="mb-3 text-sm font-medium text-[var(--text)]">Theme</p>
                <div className="flex gap-3">
                  <button type="button" className={`secondary-button ${form.theme === 'light' ? 'ring-2 ring-[var(--primary)]' : ''}`} onClick={() => setForm((current) => ({ ...current, theme: 'light' }))}>Light</button>
                  <button type="button" className={`secondary-button ${form.theme === 'dark' ? 'ring-2 ring-[var(--primary)]' : ''}`} onClick={() => setForm((current) => ({ ...current, theme: 'dark' }))}>Dark</button>
                </div>
              </div>

              <div className="space-y-4">
                {roles.map((role) => (
                  <div key={role} className="rounded-3xl border border-[var(--border)] p-4">
                    <p className="font-semibold text-[var(--text)]">{role}</p>
                    <div className="mt-3 grid gap-2 sm:grid-cols-2">
                      {Object.entries(MODULE_LABELS).map(([moduleKey, label]) => (
                        <label key={`${role}-${moduleKey}`} className="flex items-center gap-3 rounded-2xl bg-[var(--surface-muted)] px-4 py-3 text-sm text-[var(--text)]">
                          <input
                            type="checkbox"
                            checked={(form.permissions?.[role] || []).includes(moduleKey)}
                            onChange={() => togglePermission(role, moduleKey)}
                            className="h-4 w-4"
                          />
                          {label}
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Panel>
        </div>

        <div className="flex justify-end">
          <button type="submit" className="primary-button">{saving ? 'Saving...' : 'Save settings'}</button>
        </div>
      </form>
    </div>
  );
};

export default Settings;

