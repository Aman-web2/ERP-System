import { useEffect, useState } from 'react';
import { Handshake, MessageSquarePlus, PlusCircle } from 'lucide-react';
import api from '../../utils/axiosInstance';
import PageHeader from '../../components/ui/PageHeader';
import Panel from '../../components/ui/Panel';
import Modal from '../../components/ui/Modal';
import Pagination from '../../components/ui/Pagination';
import LoadingState from '../../components/ui/LoadingState';
import StatusBadge from '../../components/ui/StatusBadge';
import MetricCard from '../../components/ui/MetricCard';
import { formatCurrency, formatDate, getPaginationText } from '../../utils/formatters';

const blankCustomer = {
  name: '',
  email: '',
  phone: '',
  company: '',
  status: 'Active',
  notes: '',
  address: { city: '', state: '', country: '' },
};

const CustomerList = () => {
  const [customers, setCustomers] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [customerForm, setCustomerForm] = useState(blankCustomer);
  const [feedbackForm, setFeedbackForm] = useState({ rating: 5, comment: '' });

  const fetchCustomers = async (nextPage = page, query = search) => {
    const { data } = await api.get(`/crm/customers?page=${nextPage}&limit=8&search=${encodeURIComponent(query)}`);
    setCustomers(data.items || []);
    setPagination(data.pagination);
    if (data.items?.length && !selectedCustomer) {
      fetchCustomerDetails(data.items[0]._id);
    }
  };

  const fetchCustomerDetails = async (customerId) => {
    const { data } = await api.get(`/crm/customers/${customerId}`);
    setSelectedCustomer(data);
  };

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        await fetchCustomers();
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchCustomers(1, search);
      setPage(1);
    }, 350);
    return () => clearTimeout(timer);
  }, [search]);

  const activeCount = customers.filter((customer) => customer.status === 'Active').length;
  const leadCount = customers.filter((customer) => customer.status === 'Lead').length;

  const saveCustomer = async (event) => {
    event.preventDefault();
    await api.post('/crm/customers', customerForm);
    setCustomerForm(blankCustomer);
    setModalOpen(false);
    fetchCustomers(page, search);
  };

  const submitFeedback = async (event) => {
    event.preventDefault();
    await api.post(`/crm/customers/${selectedCustomer._id}/feedback`, feedbackForm);
    setFeedbackForm({ rating: 5, comment: '' });
    fetchCustomerDetails(selectedCustomer._id);
  };

  if (loading) {
    return <LoadingState label="Loading CRM workspace..." />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="CRM workspace"
        description="Manage customer records, review purchase history, and capture customer feedback that informs follow-up actions."
        actions={<button className="primary-button inline-flex items-center gap-2" onClick={() => setModalOpen(true)}><PlusCircle size={18} /> Add customer</button>}
      />

      <div className="grid gap-4 md:grid-cols-3">
        <MetricCard label="Customers on page" value={customers.length} icon={<Handshake size={20} />} tone="primary" />
        <MetricCard label="Active customers" value={activeCount} icon={<Handshake size={20} />} tone="success" />
        <MetricCard label="Leads on page" value={leadCount} icon={<MessageSquarePlus size={20} />} tone="warning" />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <Panel title="Customer directory" subtitle={getPaginationText(pagination)} actions={<input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search customers" className="max-w-sm" />}>
          <div className="table-shell">
            <table>
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Company</th>
                  <th>Status</th>
                  <th>Phone</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((customer) => (
                  <tr key={customer._id} onClick={() => fetchCustomerDetails(customer._id)} className="cursor-pointer">
                    <td>
                      <p className="font-medium text-[var(--text)]">{customer.name}</p>
                      <p className="text-sm text-[var(--muted)]">{customer.email}</p>
                    </td>
                    <td>{customer.company || 'Independent'}</td>
                    <td><StatusBadge>{customer.status}</StatusBadge></td>
                    <td>{customer.phone}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination pagination={pagination} onPageChange={(nextPage) => { setPage(nextPage); fetchCustomers(nextPage, search); }} />
        </Panel>

        <Panel title="Customer profile" subtitle="Purchase history and direct feedback.">
          {selectedCustomer ? (
            <div className="space-y-5">
              <div>
                <h3 className="text-2xl font-semibold text-[var(--text)]">{selectedCustomer.name}</h3>
                <p className="mt-1 text-sm text-[var(--muted)]">{selectedCustomer.company || 'Independent'} • {selectedCustomer.email}</p>
                <p className="mt-2 text-sm text-[var(--muted)]">Total spent: {formatCurrency(selectedCustomer.totalSpent || 0)}</p>
              </div>

              <div>
                <p className="stat-kicker">Purchase history</p>
                <div className="mt-3 space-y-2">
                  {(selectedCustomer.purchaseHistory || []).map((order) => (
                    <div key={order._id} className="rounded-2xl bg-[var(--surface-muted)] px-4 py-3">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="font-medium text-[var(--text)]">Order {order._id.slice(-6).toUpperCase()}</p>
                          <p className="text-sm text-[var(--muted)]">{formatDate(order.createdAt)}</p>
                        </div>
                        <div className="text-right">
                          <StatusBadge>{order.status}</StatusBadge>
                          <p className="mt-2 text-sm text-[var(--muted)]">{formatCurrency(order.totalAmount)}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                  {!selectedCustomer.purchaseHistory?.length ? <p className="text-sm text-[var(--muted)]">No purchases recorded.</p> : null}
                </div>
              </div>

              <div>
                <p className="stat-kicker">Feedback</p>
                <div className="mt-3 space-y-2">
                  {(selectedCustomer.feedback || []).map((feedback, index) => (
                    <div key={`${feedback.comment}-${index}`} className="rounded-2xl border border-[var(--border)] px-4 py-3">
                      <div className="flex items-center justify-between">
                        <StatusBadge>{`${feedback.rating}/5`}</StatusBadge>
                        <span className="text-xs text-[var(--muted)]">{formatDate(feedback.createdAt)}</span>
                      </div>
                      <p className="mt-2 text-sm text-[var(--text)]">{feedback.comment}</p>
                    </div>
                  ))}
                </div>
                <form className="mt-4 space-y-3" onSubmit={submitFeedback}>
                  <select value={feedbackForm.rating} onChange={(event) => setFeedbackForm((current) => ({ ...current, rating: Number(event.target.value) }))}>
                    {[5, 4, 3, 2, 1].map((rating) => <option key={rating} value={rating}>{rating} Stars</option>)}
                  </select>
                  <textarea rows="3" value={feedbackForm.comment} onChange={(event) => setFeedbackForm((current) => ({ ...current, comment: event.target.value }))} placeholder="Capture customer feedback" required />
                  <button type="submit" className="primary-button">Save feedback</button>
                </form>
              </div>
            </div>
          ) : (
            <p className="text-sm text-[var(--muted)]">Select a customer to inspect details.</p>
          )}
        </Panel>
      </div>

      <Modal open={modalOpen} title="Add customer" onClose={() => setModalOpen(false)}>
        <form className="field-grid two" onSubmit={saveCustomer}>
          <input value={customerForm.name} onChange={(event) => setCustomerForm((current) => ({ ...current, name: event.target.value }))} placeholder="Customer name" required />
          <input type="email" value={customerForm.email} onChange={(event) => setCustomerForm((current) => ({ ...current, email: event.target.value }))} placeholder="Email" required />
          <input value={customerForm.phone} onChange={(event) => setCustomerForm((current) => ({ ...current, phone: event.target.value }))} placeholder="Phone" required />
          <input value={customerForm.company} onChange={(event) => setCustomerForm((current) => ({ ...current, company: event.target.value }))} placeholder="Company" />
          <select value={customerForm.status} onChange={(event) => setCustomerForm((current) => ({ ...current, status: event.target.value }))}>
            <option value="Active">Active</option>
            <option value="Lead">Lead</option>
            <option value="Inactive">Inactive</option>
          </select>
          <input value={customerForm.address.city} onChange={(event) => setCustomerForm((current) => ({ ...current, address: { ...current.address, city: event.target.value } }))} placeholder="City" />
          <input value={customerForm.address.state} onChange={(event) => setCustomerForm((current) => ({ ...current, address: { ...current.address, state: event.target.value } }))} placeholder="State" />
          <input value={customerForm.address.country} onChange={(event) => setCustomerForm((current) => ({ ...current, address: { ...current.address, country: event.target.value } }))} placeholder="Country" />
          <textarea className="col-span-full" rows="4" value={customerForm.notes} onChange={(event) => setCustomerForm((current) => ({ ...current, notes: event.target.value }))} placeholder="Notes" />
          <div className="col-span-full flex justify-end gap-3">
            <button type="button" className="ghost-button" onClick={() => setModalOpen(false)}>Cancel</button>
            <button type="submit" className="primary-button">Save customer</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default CustomerList;

