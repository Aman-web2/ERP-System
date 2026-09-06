import { useState, useEffect, useMemo } from 'react';
import { Handshake, MessageSquarePlus, PlusCircle, Search, Mail, Phone, Building2, MapPin, Star, ArrowRight, Clock } from 'lucide-react';
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

  const stats = useMemo(() => {
    const total = customers.length;
    const active = customers.filter(c => c.status === 'Active').length;
    const leads = customers.filter(c => c.status === 'Lead').length;
    return { total, active, leads };
  }, [customers]);

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
    return <LoadingState label="Synchronizing CRM database..." />;
  }

  return (
    <div className="space-y-6 pb-8">
      <PageHeader
        title="Relationship Management"
        description="Oversee customer engagements, track lifecycle status, and maintain satisfaction records."
        actions={<button className="primary-button inline-flex items-center gap-2" onClick={() => setModalOpen(true)}><PlusCircle size={18} /> Add Customer</button>}
      />

      <div className="grid gap-4 md:grid-cols-3">
        <MetricCard label="Current Reach" value={stats.total} icon={<Handshake size={20} />} tone="primary" />
        <MetricCard label="Active Accounts" value={stats.active} icon={<Handshake size={20} />} tone="success" />
        <MetricCard label="Qualified Leads" value={stats.leads} icon={<MessageSquarePlus size={20} />} tone="warning" />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <Panel 
          title="Customer Directory" 
          subtitle={getPaginationText(pagination)} 
          actions={
            <div className="relative group w-full max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted group-focus-within:text-primary transition-colors" size={16} />
              <input 
                value={search} 
                onChange={(event) => setSearch(event.target.value)} 
                placeholder="Search database..." 
                className="pl-10 h-10 text-sm" 
              />
            </div>
          }
        >
          <div className="table-shell">
            <table>
              <thead>
                <tr>
                  <th>Identity</th>
                  <th>Affiliation</th>
                  <th>Status</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {customers.map((customer) => (
                  <tr 
                    key={customer._id} 
                    onClick={() => fetchCustomerDetails(customer._id)} 
                    className={`cursor-pointer transition-colors ${selectedCustomer?._id === customer._id ? 'bg-primary/5' : ''}`}
                  >
                    <td>
                      <p className="font-semibold text-text">{customer.name}</p>
                      <p className="text-[11px] text-muted font-medium uppercase mt-0.5 tracking-tight">{customer.email}</p>
                    </td>
                    <td>
                      <p className="text-sm font-medium text-text">{customer.company || 'Private Entity'}</p>
                    </td>
                    <td><StatusBadge>{customer.status}</StatusBadge></td>
                    <td className="text-right pr-4"><ArrowRight size={14} className="inline text-muted" /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination pagination={pagination} onPageChange={(nextPage) => { setPage(nextPage); fetchCustomers(nextPage, search); }} />
        </Panel>

        <Panel title="Customer Intelligence" subtitle="Deep dive into engagement metrics and history.">
          {selectedCustomer ? (
            <div className="space-y-8">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-2xl font-bold text-text tracking-tight">{selectedCustomer.name}</h3>
                  <div className="flex flex-wrap items-center gap-3 mt-2">
                    <div className="flex items-center gap-1 text-[11px] font-bold text-muted uppercase">
                      <Building2 size={12} /> {selectedCustomer.company || 'Independent'}
                    </div>
                    <div className="flex items-center gap-1 text-[11px] font-bold text-muted uppercase">
                      <Mail size={12} /> {selectedCustomer.email}
                    </div>
                  </div>
                </div>
                <StatusBadge>{selectedCustomer.status}</StatusBadge>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-surface-muted border border-border">
                  <p className="text-[10px] font-bold text-muted uppercase tracking-widest">Total Value</p>
                  <p className="text-xl font-bold text-text mt-1">{formatCurrency(selectedCustomer.totalSpent || 0)}</p>
                </div>
                <div className="p-4 rounded-xl bg-surface-muted border border-border">
                  <p className="text-[10px] font-bold text-muted uppercase tracking-widest">Phone Record</p>
                  <p className="text-sm font-bold text-text mt-1">{selectedCustomer.phone || '--'}</p>
                </div>
              </div>

              <div>
                <h4 className="text-[11px] font-bold text-text uppercase tracking-widest flex items-center gap-2 mb-4">
                  <Clock size={12} className="text-primary" /> Engagement Timeline
                </h4>
                <div className="space-y-3">
                  {(selectedCustomer.purchaseHistory || []).map((order) => (
                    <div key={order._id} className="p-4 rounded-xl border border-border bg-surface hover:border-primary/30 transition-all">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs font-bold text-text uppercase">Order #{order._id.slice(-6).toUpperCase()}</p>
                          <p className="text-[10px] text-muted font-medium mt-0.5">{formatDate(order.createdAt)}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold text-text">{formatCurrency(order.totalAmount)}</p>
                          <div className="mt-1"><StatusBadge>{order.status}</StatusBadge></div>
                        </div>
                      </div>
                    </div>
                  ))}
                  {!selectedCustomer.purchaseHistory?.length && (
                    <p className="text-xs text-muted font-medium italic p-4 text-center border border-dashed border-border rounded-xl">No transaction history found.</p>
                  )}
                </div>
              </div>

              <div>
                <h4 className="text-[11px] font-bold text-text uppercase tracking-widest flex items-center gap-2 mb-4">
                  <MessageSquarePlus size={12} className="text-primary" /> Satisfaction Logs
                </h4>
                <div className="space-y-3 mb-6">
                  {(selectedCustomer.feedback || []).map((feedback, index) => (
                    <div key={index} className="p-4 rounded-xl border-l-4 border-l-primary bg-surface-muted">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex gap-0.5">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} size={10} className={i < feedback.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'} />
                          ))}
                        </div>
                        <span className="text-[10px] text-muted font-bold">{formatDate(feedback.createdAt)}</span>
                      </div>
                      <p className="text-xs text-text leading-relaxed">{feedback.comment}</p>
                    </div>
                  ))}
                </div>
                
                <form className="space-y-3 p-4 bg-surface-muted rounded-xl border border-border" onSubmit={submitFeedback}>
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-bold text-text uppercase tracking-widest">Log New Feedback</label>
                    <select 
                      className="w-24 h-8 text-[11px] font-bold"
                      value={feedbackForm.rating} 
                      onChange={(e) => setFeedbackForm(prev => ({ ...prev, rating: Number(e.target.value) }))}
                    >
                      {[5, 4, 3, 2, 1].map((r) => <option key={r} value={r}>{r} Stars</option>)}
                    </select>
                  </div>
                  <textarea rows="3" value={feedbackForm.comment} onChange={(e) => setFeedbackForm(prev => ({ ...prev, comment: e.target.value }))} placeholder="Enter observation..." required className="text-sm bg-surface border-none focus:ring-1 focus:ring-primary" />
                  <button type="submit" className="primary-button w-full h-10 text-xs font-bold uppercase tracking-widest">Post Log</button>
                </form>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-64 text-center opacity-40">
              <Handshake size={48} className="mb-4" />
              <p className="text-sm font-medium">Select a profile from the directory<br/>to view detailed accounts.</p>
            </div>
          )}
        </Panel>
      </div>

      <Modal open={modalOpen} title="Onboard New Customer" onClose={() => setModalOpen(false)} width="max-w-2xl">
        <form className="field-grid two" onSubmit={saveCustomer}>
          <div>
            <label className="text-xs font-semibold text-text mb-1 block">Full Name / Primary Contact</label>
            <input value={customerForm.name} onChange={(e) => setCustomerForm(prev => ({ ...prev, name: e.target.value }))} placeholder="e.g. John Doe" required />
          </div>
          <div>
            <label className="text-xs font-semibold text-text mb-1 block">Email Address</label>
            <input type="email" value={customerForm.email} onChange={(e) => setCustomerForm(prev => ({ ...prev, email: e.target.value }))} placeholder="john@example.com" required />
          </div>
          <div>
            <label className="text-xs font-semibold text-text mb-1 block">Contact Number</label>
            <input value={customerForm.phone} onChange={(e) => setCustomerForm(prev => ({ ...prev, phone: e.target.value }))} placeholder="+1..." required />
          </div>
          <div>
            <label className="text-xs font-semibold text-text mb-1 block">Company / Organization</label>
            <input value={customerForm.company} onChange={(e) => setCustomerForm(prev => ({ ...prev, company: e.target.value }))} placeholder="Acme Corp" />
          </div>
          <div>
            <label className="text-xs font-semibold text-text mb-1 block">Account Status</label>
            <select value={customerForm.status} onChange={(e) => setCustomerForm(prev => ({ ...prev, status: e.target.value }))}>
              <option value="Active">Active Subscription</option>
              <option value="Lead">Potential Lead</option>
              <option value="Inactive">Dormant Account</option>
            </select>
          </div>
          <div className="col-span-full pt-4 flex justify-end gap-3">
            <button type="button" className="ghost-button" onClick={() => setModalOpen(false)}>Cancel</button>
            <button type="submit" className="primary-button px-8">Save Customer Profile</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default CustomerList;

