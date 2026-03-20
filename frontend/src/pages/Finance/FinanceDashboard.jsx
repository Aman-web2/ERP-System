import { useEffect, useState } from 'react';
import { Download, Landmark, ReceiptText, WalletCards } from 'lucide-react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import api from '../../utils/axiosInstance';
import PageHeader from '../../components/ui/PageHeader';
import Panel from '../../components/ui/Panel';
import MetricCard from '../../components/ui/MetricCard';
import Modal from '../../components/ui/Modal';
import LoadingState from '../../components/ui/LoadingState';
import StatusBadge from '../../components/ui/StatusBadge';
import { formatCurrency, formatDate } from '../../utils/formatters';

const FinanceDashboard = () => {
  const [summary, setSummary] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [payrolls, setPayrolls] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [transactionModal, setTransactionModal] = useState(false);
  const [payrollModal, setPayrollModal] = useState(false);
  const [transactionForm, setTransactionForm] = useState({ type: 'Income', amount: 0, category: '', description: '', status: 'Completed' });
  const [payrollForm, setPayrollForm] = useState({ employee: '', month: 3, year: 2026, basicSalary: 0, allowances: 0, deductions: 0, status: 'Pending' });

  const fetchFinance = async () => {
    setLoading(true);
    try {
      const [summaryResponse, transactionResponse, invoiceResponse, payrollResponse, employeeResponse, customerResponse] = await Promise.all([
        api.get('/finance/summary'),
        api.get('/finance/transactions?limit=8'),
        api.get('/finance/invoices?limit=8'),
        api.get('/finance/payrolls?limit=8'),
        api.get('/employees?limit=50'),
        api.get('/crm/customers?limit=50'),
      ]);
      setSummary(summaryResponse.data);
      setTransactions(transactionResponse.data.items || []);
      setInvoices(invoiceResponse.data.items || []);
      setPayrolls(payrollResponse.data.items || []);
      setEmployees(employeeResponse.data.items || []);
      setCustomers(customerResponse.data.items || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFinance();
  }, []);

  const addTransaction = async (event) => {
    event.preventDefault();
    await api.post('/finance/transactions', transactionForm);
    setTransactionModal(false);
    setTransactionForm({ type: 'Income', amount: 0, category: '', description: '', status: 'Completed' });
    fetchFinance();
  };

  const createPayroll = async (event) => {
    event.preventDefault();
    await api.post('/finance/payrolls', payrollForm);
    setPayrollModal(false);
    setPayrollForm({ employee: '', month: 3, year: 2026, basicSalary: 0, allowances: 0, deductions: 0, status: 'Pending' });
    fetchFinance();
  };

  const markInvoicePaid = async (invoiceId) => {
    await api.put(`/finance/invoices/${invoiceId}/status`, { status: 'Paid' });
    fetchFinance();
  };

  const downloadInvoice = async (invoiceId, invoiceNumber) => {
    const response = await api.get(`/finance/invoices/${invoiceId}/pdf`, { responseType: 'blob' });
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${invoiceNumber}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  const markPayrollPaid = async (payrollId) => {
    await api.put(`/finance/payrolls/${payrollId}/status`, { status: 'Paid' });
    fetchFinance();
  };

  if (loading || !summary) {
    return <LoadingState label="Loading finance and accounting..." />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Finance and accounting"
        description="Track income, expenses, invoices, payroll, and profitability from one finance cockpit."
        actions={
          <div className="flex gap-3">
            <button className="secondary-button" onClick={() => setPayrollModal(true)}>Create payroll</button>
            <button className="primary-button" onClick={() => setTransactionModal(true)}>Add transaction</button>
          </div>
        }
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Balance" value={formatCurrency(summary.balance)} icon={<Landmark size={20} />} tone="primary" />
        <MetricCard label="Income" value={formatCurrency(summary.income)} icon={<WalletCards size={20} />} tone="success" />
        <MetricCard label="Expense" value={formatCurrency(summary.expense)} icon={<WalletCards size={20} />} tone="danger" />
        <MetricCard label="Unpaid invoices" value={summary.unpaidInvoices} icon={<ReceiptText size={20} />} tone="warning" />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
        <Panel title="Cashflow trend" subtitle="Income and expense trends based on finance entries.">
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={summary.charts}>
                <defs>
                  <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#16a34a" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#16a34a" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#dc2626" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#dc2626" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(148,163,184,0.18)" />
                <XAxis dataKey="name" stroke="var(--muted)" />
                <YAxis stroke="var(--muted)" />
                <Tooltip contentStyle={{ background: 'var(--surface-strong)', borderRadius: 18, border: '1px solid var(--border)' }} />
                <Area type="monotone" dataKey="income" stroke="#16a34a" fill="url(#incomeGradient)" strokeWidth={3} />
                <Area type="monotone" dataKey="expense" stroke="#dc2626" fill="url(#expenseGradient)" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        <Panel title="Transactions" subtitle="Most recent financial entries.">
          <div className="space-y-3">
            {transactions.map((transaction) => (
              <div key={transaction._id} className="rounded-3xl border border-[var(--border)] px-4 py-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-medium text-[var(--text)]">{transaction.description}</p>
                    <p className="text-sm text-[var(--muted)]">{transaction.category} • {formatDate(transaction.date)}</p>
                  </div>
                  <div className="text-right">
                    <StatusBadge>{transaction.status}</StatusBadge>
                    <p className="mt-2 font-semibold text-[var(--text)]">{transaction.type === 'Income' ? '+' : '-'} {formatCurrency(transaction.amount)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Panel>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <Panel title="Invoices" subtitle="Generated invoices with PDF export.">
          <div className="table-shell">
            <table>
              <thead>
                <tr>
                  <th>Invoice</th>
                  <th>Customer</th>
                  <th>Status</th>
                  <th>Total</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {invoices.map((invoice) => (
                  <tr key={invoice._id}>
                    <td>
                      <p className="font-medium text-[var(--text)]">{invoice.invoiceNumber}</p>
                      <p className="text-sm text-[var(--muted)]">Due {formatDate(invoice.dueDate)}</p>
                    </td>
                    <td>{invoice.customer?.name || 'Unknown'}</td>
                    <td><StatusBadge>{invoice.status}</StatusBadge></td>
                    <td>{formatCurrency(invoice.totalAmount)}</td>
                    <td>
                      <div className="flex gap-2">
                        <button className="secondary-button px-3 py-2" onClick={() => downloadInvoice(invoice._id, invoice.invoiceNumber)}><Download size={16} /></button>
                        {invoice.status !== 'Paid' ? <button className="primary-button px-3 py-2" onClick={() => markInvoicePaid(invoice._id)}>Mark paid</button> : null}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>

        <Panel title="Payroll" subtitle="Salary processing and payout status.">
          <div className="table-shell">
            <table>
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Period</th>
                  <th>Net salary</th>
                  <th>Status</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {payrolls.map((payroll) => (
                  <tr key={payroll._id}>
                    <td>{payroll.employee?.name || 'Unknown'}</td>
                    <td>{payroll.month}/{payroll.year}</td>
                    <td>{formatCurrency(payroll.netSalary)}</td>
                    <td><StatusBadge>{payroll.status}</StatusBadge></td>
                    <td>{payroll.status !== 'Paid' ? <button className="primary-button px-3 py-2" onClick={() => markPayrollPaid(payroll._id)}>Mark paid</button> : null}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
      </div>

      <Modal open={transactionModal} title="Add transaction" onClose={() => setTransactionModal(false)} width="max-w-xl">
        <form className="space-y-4" onSubmit={addTransaction}>
          <select value={transactionForm.type} onChange={(event) => setTransactionForm((current) => ({ ...current, type: event.target.value }))}>
            <option value="Income">Income</option>
            <option value="Expense">Expense</option>
          </select>
          <input type="number" min="0" value={transactionForm.amount} onChange={(event) => setTransactionForm((current) => ({ ...current, amount: Number(event.target.value) }))} placeholder="Amount" required />
          <input value={transactionForm.category} onChange={(event) => setTransactionForm((current) => ({ ...current, category: event.target.value }))} placeholder="Category" required />
          <textarea rows="4" value={transactionForm.description} onChange={(event) => setTransactionForm((current) => ({ ...current, description: event.target.value }))} placeholder="Description" required />
          <div className="flex justify-end gap-3">
            <button type="button" className="ghost-button" onClick={() => setTransactionModal(false)}>Cancel</button>
            <button type="submit" className="primary-button">Save transaction</button>
          </div>
        </form>
      </Modal>

      <Modal open={payrollModal} title="Create payroll" onClose={() => setPayrollModal(false)} width="max-w-2xl">
        <form className="field-grid two" onSubmit={createPayroll}>
          <select value={payrollForm.employee} onChange={(event) => setPayrollForm((current) => ({ ...current, employee: event.target.value }))} required>
            <option value="">Select employee</option>
            {employees.map((employee) => <option key={employee._id} value={employee._id}>{employee.name}</option>)}
          </select>
          <select value={payrollForm.status} onChange={(event) => setPayrollForm((current) => ({ ...current, status: event.target.value }))}>
            <option value="Pending">Pending</option>
            <option value="Paid">Paid</option>
          </select>
          <input type="number" min="1" max="12" value={payrollForm.month} onChange={(event) => setPayrollForm((current) => ({ ...current, month: Number(event.target.value) }))} placeholder="Month" required />
          <input type="number" min="2024" value={payrollForm.year} onChange={(event) => setPayrollForm((current) => ({ ...current, year: Number(event.target.value) }))} placeholder="Year" required />
          <input type="number" min="0" value={payrollForm.basicSalary} onChange={(event) => setPayrollForm((current) => ({ ...current, basicSalary: Number(event.target.value) }))} placeholder="Basic salary" required />
          <input type="number" min="0" value={payrollForm.allowances} onChange={(event) => setPayrollForm((current) => ({ ...current, allowances: Number(event.target.value) }))} placeholder="Allowances" required />
          <input type="number" min="0" value={payrollForm.deductions} onChange={(event) => setPayrollForm((current) => ({ ...current, deductions: Number(event.target.value) }))} placeholder="Deductions" required />
          <div className="col-span-full flex justify-end gap-3">
            <button type="button" className="ghost-button" onClick={() => setPayrollModal(false)}>Cancel</button>
            <button type="submit" className="primary-button">Save payroll</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default FinanceDashboard;

