import { useState, useEffect, useMemo } from 'react';
import { Plus, Save, Trash2, UserPlus, Search, Users, UserCheck, Coins } from 'lucide-react';
import api from '../../utils/axiosInstance';
import PageHeader from '../../components/ui/PageHeader';
import Panel from '../../components/ui/Panel';
import Modal from '../../components/ui/Modal';
import MetricCard from '../../components/ui/MetricCard';
import Pagination from '../../components/ui/Pagination';
import LoadingState from '../../components/ui/LoadingState';
import StatusBadge from '../../components/ui/StatusBadge';
import { formatCurrency, formatDate, getPaginationText } from '../../utils/formatters';

const emptyEmployeeForm = {
  name: '',
  email: '',
  password: '',
  role: 'Employee',
  department: '',
  designation: '',
  salary: 0,
  phone: '',
  status: 'Active',
};

const EmployeeList = () => {
  const [employees, setEmployees] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [designations, setDesignations] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [employeeForm, setEmployeeForm] = useState(emptyEmployeeForm);
  const [departmentForm, setDepartmentForm] = useState({ name: '', description: '' });
  const [designationForm, setDesignationForm] = useState({ title: '', department: '', description: '' });

  const fetchEmployees = async (currentPage = page, query = search) => {
    const { data } = await api.get(`/employees?page=${currentPage}&limit=8&search=${encodeURIComponent(query)}`);
    setEmployees(data.items);
    setPagination(data.pagination);
  };

  const fetchPageData = async () => {
    setLoading(true);
    try {
      const [departmentResponse, designationResponse, attendanceResponse] = await Promise.all([
        api.get('/departments'),
        api.get('/departments/designations'),
        api.get('/attendance?limit=6'),
      ]);
      await fetchEmployees();
      setDepartments(departmentResponse.data);
      setDesignations(designationResponse.data);
      setAttendance(attendanceResponse.data.items || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPageData();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchEmployees(1, search);
      setPage(1);
    }, 350);

    return () => clearTimeout(timer);
  }, [search]);

  const headcountStats = useMemo(() => ({
    total: employees.length,
    active: employees.filter((employee) => employee.isActive).length,
    payroll: employees.reduce((sum, employee) => sum + Number(employee.salary || 0), 0),
  }), [employees]);

  const openCreateModal = () => {
    setEditingEmployee(null);
    setEmployeeForm(emptyEmployeeForm);
    setModalOpen(true);
  };

  const openEditModal = (employee) => {
    setEditingEmployee(employee);
    setEmployeeForm({
      name: employee.name,
      email: employee.email,
      password: '',
      role: employee.role,
      department: employee.department?._id || '',
      designation: employee.designation?._id || '',
      salary: employee.salary || 0,
      phone: employee.phone || '',
      isActive: employee.isActive,
      status: employee.status || 'Active',
    });
    setModalOpen(true);
  };

  const saveEmployee = async (event) => {
    event.preventDefault();
    try {
      const payload = { ...employeeForm };
      if (!payload.password) {
        delete payload.password;
      }
      if (editingEmployee) {
        await api.put(`/employees/${editingEmployee._id}`, payload);
      } else {
        await api.post('/employees', payload);
      }
      setModalOpen(false);
      setEmployeeForm(emptyEmployeeForm);
      fetchEmployees(page, search);
    } catch (error) {
      console.error(error);
      alert(error?.response?.data?.message || 'Unable to save employee');
    }
  };

  const removeEmployee = async (employeeId) => {
    try {
      await api.delete(`/employees/${employeeId}`);
      fetchEmployees(page, search);
    } catch (error) {
      alert(error?.response?.data?.message || 'Unable to delete employee');
    }
  };

  const createDepartment = async (event) => {
    event.preventDefault();
    await api.post('/departments', departmentForm);
    setDepartmentForm({ name: '', description: '' });
    fetchPageData();
  };

  const createDesignation = async (event) => {
    event.preventDefault();
    await api.post('/departments/designations', designationForm);
    setDesignationForm({ title: '', department: '', description: '' });
    fetchPageData();
  };

  if (loading) {
    return <LoadingState label="Loading HR workspace..." />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Employee Management"
        description="View and manage employee records, organizational structure, and operational status."
        actions={<button className="primary-button inline-flex items-center gap-2" onClick={openCreateModal}><UserPlus size={18} /> Add Employee</button>}
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <MetricCard label="Total Staff" value={headcountStats.total} helper="Registered employees" icon={<Users size={20} />} tone="primary" />
        <MetricCard label="Active Status" value={headcountStats.active} helper="Login enabled" icon={<UserCheck size={20} />} tone="success" />
        <MetricCard label="Monthly Payroll" value={formatCurrency(headcountStats.payroll)} helper="Combined basic salary" icon={<Coins size={20} />} tone="warning" />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.4fr_0.8fr]">
        <Panel
          title="Employee Directory"
          subtitle={getPaginationText(pagination)}
          actions={
            <div className="relative group w-full max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted group-focus-within:text-primary transition-colors" size={16} />
              <input 
                value={search} 
                onChange={(event) => setSearch(event.target.value)} 
                placeholder="Search staff, email or ID..." 
                className="pl-10 h-10 text-sm" 
              />
            </div>
          }
        >
          <div className="table-shell">
            <table>
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Role</th>
                  <th>Department</th>
                  <th>Salary</th>
                  <th>Status</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {employees.map((employee) => (
                  <tr key={employee._id}>
                    <td>
                      <p className="font-medium text-[var(--text)]">{employee.name}</p>
                      <p className="text-sm text-[var(--muted)]">{employee.email}</p>
                      <p className="text-xs text-[var(--muted)]">{employee.employeeId}</p>
                    </td>
                    <td><StatusBadge>{employee.role}</StatusBadge></td>
                    <td>
                      <p className="text-[var(--text)]">{employee.department?.name || 'Unassigned'}</p>
                      <p className="text-sm text-[var(--muted)]">{employee.designation?.title || 'No designation'}</p>
                    </td>
                    <td>{formatCurrency(employee.salary)}</td>
                    <td>
                      <StatusBadge>{employee.isActive ? 'Login Enabled' : 'Login Disabled'}</StatusBadge>
                      <div className="mt-1">
                        <StatusBadge>{employee.status || 'Active'}</StatusBadge>
                      </div>
                    </td>
                    <td>
                      <div className="flex justify-end gap-2">
                        <button className="secondary-button px-3 py-2" onClick={() => openEditModal(employee)}>
                          Edit
                        </button>
                        <button className="danger-button px-3 py-2" onClick={() => removeEmployee(employee._id)}>
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination
            pagination={pagination}
            onPageChange={(nextPage) => {
              setPage(nextPage);
              fetchEmployees(nextPage, search);
            }}
          />
        </Panel>

        <div className="space-y-6">
          <Panel title="Departments" subtitle="Add and assign organizational units.">
            <form className="space-y-3" onSubmit={createDepartment}>
              <input value={departmentForm.name} onChange={(event) => setDepartmentForm((current) => ({ ...current, name: event.target.value }))} placeholder="Department name" required />
              <textarea value={departmentForm.description} onChange={(event) => setDepartmentForm((current) => ({ ...current, description: event.target.value }))} placeholder="Description" rows="3" />
              <button className="primary-button inline-flex items-center gap-2" type="submit"><Plus size={16} /> Create department</button>
            </form>
            <div className="mt-4 space-y-2">
              {departments.map((department) => (
                <div key={department._id} className="rounded-2xl bg-[var(--surface-muted)] px-4 py-3">
                  <p className="font-medium text-[var(--text)]">{department.name}</p>
                  <p className="text-sm text-[var(--muted)]">{department.description || 'No description'}</p>
                </div>
              ))}
            </div>
          </Panel>

          <Panel title="Designations" subtitle="Map titles to departments.">
            <form className="space-y-3" onSubmit={createDesignation}>
              <input value={designationForm.title} onChange={(event) => setDesignationForm((current) => ({ ...current, title: event.target.value }))} placeholder="Designation title" required />
              <select value={designationForm.department} onChange={(event) => setDesignationForm((current) => ({ ...current, department: event.target.value }))} required>
                <option value="">Select department</option>
                {departments.map((department) => <option key={department._id} value={department._id}>{department.name}</option>)}
              </select>
              <textarea value={designationForm.description} onChange={(event) => setDesignationForm((current) => ({ ...current, description: event.target.value }))} placeholder="Description" rows="3" />
              <button className="primary-button inline-flex items-center gap-2" type="submit"><Save size={16} /> Save designation</button>
            </form>
            <div className="mt-4 space-y-2">
              {designations.map((designation) => (
                <div key={designation._id} className="rounded-2xl bg-[var(--surface-muted)] px-4 py-3">
                  <p className="font-medium text-[var(--text)]">{designation.title}</p>
                  <p className="text-sm text-[var(--muted)]">{designation.department?.name || 'No department'}</p>
                </div>
              ))}
            </div>
          </Panel>
        </div>
      </div>

      <Panel title="Attendance snapshot" subtitle="Most recent attendance records submitted today.">
        <div className="table-shell">
          <table>
            <thead>
              <tr>
                <th>Employee</th>
                <th>Date</th>
                <th>Clock in</th>
                <th>Clock out</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {attendance.map((record) => (
                <tr key={record._id}>
                  <td>{record.employee?.name || '-'}</td>
                  <td>{formatDate(record.date)}</td>
                  <td>{record.clockIn ? new Date(record.clockIn).toLocaleTimeString() : '-'}</td>
                  <td>{record.clockOut ? new Date(record.clockOut).toLocaleTimeString() : '-'}</td>
                  <td><StatusBadge>{record.status}</StatusBadge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>

      <Modal open={modalOpen} title={editingEmployee ? 'Edit employee' : 'Add employee'} onClose={() => setModalOpen(false)}>
        <form className="field-grid two" onSubmit={saveEmployee}>
          <div>
            <label className="mb-2 block text-sm font-medium text-[var(--text)]">Name</label>
            <input value={employeeForm.name} onChange={(event) => setEmployeeForm((current) => ({ ...current, name: event.target.value }))} required />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-[var(--text)]">Email</label>
            <input type="email" value={employeeForm.email} onChange={(event) => setEmployeeForm((current) => ({ ...current, email: event.target.value }))} required />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-[var(--text)]">Password</label>
            <input type="password" value={employeeForm.password} onChange={(event) => setEmployeeForm((current) => ({ ...current, password: event.target.value }))} required={!editingEmployee} />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-[var(--text)]">Role</label>
            <select value={employeeForm.role} onChange={(event) => setEmployeeForm((current) => ({ ...current, role: event.target.value }))}>
              <option value="Employee">Employee</option>
              <option value="HR">HR</option>
              <option value="Accountant">Accountant</option>
              <option value="Admin">Admin</option>
            </select>
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-[var(--text)]">Department</label>
            <select value={employeeForm.department} onChange={(event) => setEmployeeForm((current) => ({ ...current, department: event.target.value }))}>
              <option value="">Select department</option>
              {departments.map((department) => <option key={department._id} value={department._id}>{department.name}</option>)}
            </select>
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-[var(--text)]">Designation</label>
            <select value={employeeForm.designation} onChange={(event) => setEmployeeForm((current) => ({ ...current, designation: event.target.value }))}>
              <option value="">Select designation</option>
              {designations.filter((designation) => !employeeForm.department || designation.department?._id === employeeForm.department).map((designation) => <option key={designation._id} value={designation._id}>{designation.title}</option>)}
            </select>
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-[var(--text)]">Salary</label>
            <input type="number" value={employeeForm.salary} onChange={(event) => setEmployeeForm((current) => ({ ...current, salary: Number(event.target.value) }))} min="0" />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-[var(--text)]">Phone</label>
            <input value={employeeForm.phone} onChange={(event) => setEmployeeForm((current) => ({ ...current, phone: event.target.value }))} />
          </div>
          {editingEmployee ? (
            <>
              <div>
                <label className="mb-2 block text-sm font-medium text-[var(--text)]">Login Access</label>
                <select value={String(employeeForm.isActive)} onChange={(event) => setEmployeeForm((current) => ({ ...current, isActive: event.target.value === 'true' }))}>
                  <option value="true">Enabled</option>
                  <option value="false">Disabled</option>
                </select>
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-[var(--text)]">Onboarding Status</label>
                <select value={employeeForm.status} onChange={(event) => setEmployeeForm((current) => ({ ...current, status: event.target.value }))}>
                  <option value="PendingDetails">Pending Details</option>
                  <option value="PendingApproval">Pending Approval</option>
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
            </>
          ) : null}
          <div className="col-span-full flex justify-end gap-3 pt-3">
            <button type="button" className="ghost-button" onClick={() => setModalOpen(false)}>Cancel</button>
            <button type="submit" className="primary-button">Save employee</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default EmployeeList;

