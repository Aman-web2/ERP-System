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
    <div className="space-y-6 pb-6">
      <PageHeader
        title="Finance & Accounting"
        description="Monitor cash flow, manage invoices, and process payroll with precision."
        actions={
          <div className="flex gap-3">
            <button className="secondary-button" onClick={() => setPayrollModal(true)}>Process Payroll</button>
            <button className="primary-button" onClick={() => setTransactionModal(true)}>Add Transaction</button>
          </div>
        }
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Current Balance" value={formatCurrency(summary.balance)} icon={<Landmark size={20} />} tone="primary" />
        <MetricCard label="Total Income" value={formatCurrency(summary.income)} icon={<WalletCards size={20} />} tone="success" />
        <MetricCard label="Total Expenses" value={formatCurrency(summary.expense)} icon={<WalletCards size={20} />} tone="danger" />
        <MetricCard label="Pending Invoices" value={summary.unpaidInvoices} helper="Awaiting payment" icon={<ReceiptText size={20} />} tone="warning" />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
        <Panel 
          title="Cash Flow Overview" 
          subtitle="Revenue vs. Expenditure analysis for the current period."
        >
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={summary.charts} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis 
                  dataKey="name" 
                  stroke="#64748b" 
                  fontSize={12} 
                  axisLine={false}
                  tickLine={false}
                  dy={10}
                />
                <YAxis 
                  stroke="#64748b" 
                  fontSize={12} 
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip 
                  contentStyle={{ 
                    background: '#ffffff', 
                    borderRadius: 8, 
                    border: '1px solid #e2e8f0',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                  }} 
                />
                <Area type="monotone" dataKey="income" stroke="#10b981" fill="url(#incomeGradient)" strokeWidth={2} />
                <Area type="monotone" dataKey="expense" stroke="#ef4444" fill="url(#expenseGradient)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        <Panel title="Recent Transactions" subtitle="Latest financial activities recorded.">
          <div className="space-y-3">
            {transactions.map((transaction) => (
              <div key={transaction._id} className="p-4 rounded-xl border border-transparent hover:border-border hover:bg-surface-muted transition-all">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-text">{transaction.description}</p>
                    <p className="text-[11px] text-muted font-medium mt-0.5 uppercase tracking-wide">{transaction.category} • {formatDate(transaction.date)}</p>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-bold ${transaction.type === 'Income' ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {transaction.type === 'Income' ? '+' : '-'} {formatCurrency(transaction.amount)}
                    </p>
                    <div className="mt-1">
                      <StatusBadge>{transaction.status}</StatusBadge>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Panel>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <Panel title="Billing & Invoices" subtitle="Monitor outgoing clinical and project billings.">
          <div className="table-shell">
            <table>
              <thead>
                <tr>
                  <th>Invoice Details</th>
                  <th>Status</th>
                  <th>Amount</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {invoices.map((invoice) => (
                  <tr key={invoice._id}>
                    <td>
                      <p className="font-semibold text-text">{invoice.invoiceNumber}</p>
                      <p className="text-xs text-muted font-medium mt-0.5">{invoice.customer?.name || 'Unknown Entity'}</p>
                    </td>
                    <td><StatusBadge>{invoice.status}</StatusBadge></td>
                    <td className="font-bold text-text">{formatCurrency(invoice.totalAmount)}</td>
                    <td>
                      <div className="flex justify-end gap-2">
                        <button className="secondary-button p-2" onClick={() => downloadInvoice(invoice._id, invoice.invoiceNumber)} title="Download PDF"><Download size={14} /></button>
                        {invoice.status !== 'Paid' && (
                          <button className="primary-button px-3 py-1.5 text-xs font-bold" onClick={() => markInvoicePaid(invoice._id)}>Mark Paid</button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>

        <Panel title="Payroll Management" subtitle="Employee salary distribution status.">
          <div className="table-shell">
            <table>
              <thead>
                <tr>
                  <th>Staff Member</th>
                  <th>Net Payout</th>
                  <th>Status</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {payrolls.map((payroll) => (
                  <tr key={payroll._id}>
                    <td>
                      <p className="font-semibold text-text">{payroll.employee?.name || 'Unknown'}</p>
                      <p className="text-xs text-muted font-medium mt-0.5">Period: {payroll.month}/{payroll.year}</p>
                    </td>
                    <td className="font-bold text-text">{formatCurrency(payroll.netSalary)}</td>
                    <td><StatusBadge>{payroll.status}</StatusBadge></td>
                    <td>
                      <div className="flex justify-end">
                        {payroll.status !== 'Paid' && (
                          <button className="primary-button px-3 py-1.5 text-xs font-bold" onClick={() => markPayrollPaid(payroll._id)}>Disburse</button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
      </div>

      <Modal open={transactionModal} title="Record New Transaction" onClose={() => setTransactionModal(false)} width="max-w-md">
        <form className="space-y-4" onSubmit={addTransaction}>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-text mb-1 block">Entry Type</label>
              <select value={transactionForm.type} onChange={(event) => setTransactionForm((current) => ({ ...current, type: event.target.value }))}>
                <option value="Income">Income (+)</option>
                <option value="Expense">Expense (-)</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-text mb-1 block">Amount</label>
              <input type="number" min="0" value={transactionForm.amount} onChange={(event) => setTransactionForm((current) => ({ ...current, amount: Number(event.target.value) }))} placeholder="0.00" required />
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-text mb-1 block">Category</label>
            <input value={transactionForm.category} onChange={(event) => setTransactionForm((current) => ({ ...current, category: event.target.value }))} placeholder="e.g. Logistics, Utilities" required />
          </div>
          <div>
            <label className="text-xs font-semibold text-text mb-1 block">Description</label>
            <textarea rows="3" value={transactionForm.description} onChange={(event) => setTransactionForm((current) => ({ ...current, description: event.target.value }))} placeholder="Brief transaction details..." required />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button type="button" className="ghost-button" onClick={() => setTransactionModal(false)}>Cancel</button>
            <button type="submit" className="primary-button">Save Transaction</button>
          </div>
        </form>
      </Modal>

      <Modal open={payrollModal} title="Process Employee Payroll" onClose={() => setPayrollModal(false)} width="max-w-xl">
        <form className="field-grid two" onSubmit={createPayroll}>
          <div className="col-span-full">
            <label className="text-xs font-semibold text-text mb-1 block">Staff Member</label>
            <select value={payrollForm.employee} onChange={(event) => setPayrollForm((current) => ({ ...current, employee: event.target.value }))} required>
              <option value="">Select an employee</option>
              {employees.map((employee) => <option key={employee._id} value={employee._id}>{employee.name}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-text mb-1 block">Payment Status</label>
            <select value={payrollForm.status} onChange={(event) => setPayrollForm((current) => ({ ...current, status: event.target.value }))}>
              <option value="Pending">Approval Pending</option>
              <option value="Paid">Processed (Paid)</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-text mb-1 block">Payroll Period (MM/YYYY)</label>
            <div className="grid grid-cols-2 gap-2">
              <input type="number" min="1" max="12" value={payrollForm.month} onChange={(event) => setPayrollForm((current) => ({ ...current, month: Number(event.target.value) }))} placeholder="MM" required />
              <input type="number" min="2024" value={payrollForm.year} onChange={(event) => setPayrollForm((current) => ({ ...current, year: Number(event.target.value) }))} placeholder="YYYY" required />
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-text mb-1 block">Basic Salary</label>
            <input type="number" min="0" value={payrollForm.basicSalary} onChange={(event) => setPayrollForm((current) => ({ ...current, basicSalary: Number(event.target.value) }))} required />
          </div>
          <div>
            <label className="text-xs font-semibold text-text mb-1 block">Allowances</label>
            <input type="number" min="0" value={payrollForm.allowances} onChange={(event) => setPayrollForm((current) => ({ ...current, allowances: Number(event.target.value) }))} required />
          </div>
          <div className="col-span-full pt-4 flex justify-end gap-3">
            <button type="button" className="ghost-button" onClick={() => setPayrollModal(false)}>Cancel</button>
            <button type="submit" className="primary-button px-6">Generate Payroll</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default FinanceDashboard;

