import { useEffect, useMemo, useState } from 'react';
import { BarChart3, Plus, Truck, Package, CreditCard, Landmark, MapPin, Trash2, ArrowRight, Clock } from 'lucide-react';
import api from '../../utils/axiosInstance';
import PageHeader from '../../components/ui/PageHeader';
import Panel from '../../components/ui/Panel';
import Modal from '../../components/ui/Modal';
import Pagination from '../../components/ui/Pagination';
import StatusBadge from '../../components/ui/StatusBadge';
import MetricCard from '../../components/ui/MetricCard';
import LoadingState from '../../components/ui/LoadingState';
import { formatCurrency, formatDate, getPaginationText } from '../../utils/formatters';

const createLine = () => ({ product: '', quantity: 1, price: 0, name: '' });

const blankOrder = {
  customer: '',
  paymentMethod: 'Bank Transfer',
  paymentStatus: 'Pending',
  status: 'Pending',
  taxAmount: 0,
  discountAmount: 0,
  shippingAddress: { city: '', state: '', country: '' },
  orderItems: [createLine()],
};

const OrderList = () => {
  const [orders, setOrders] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [orderForm, setOrderForm] = useState(blankOrder);

  const fetchOrders = async (nextPage = page) => {
    const { data } = await api.get(`/sales/orders?page=${nextPage}&limit=10`);
    setOrders(data.items || []);
    setPagination(data.pagination);
  };

  const fetchSalesData = async () => {
    setLoading(true);
    try {
      const [ordersResponse, analyticsResponse, customerResponse, productResponse] = await Promise.all([
        api.get('/sales/orders?page=1&limit=10'),
        api.get('/sales/analytics'),
        api.get('/crm/customers?limit=100'),
        api.get('/inventory/products?limit=100'),
      ]);
      setOrders(ordersResponse.data.items || []);
      setPagination(ordersResponse.data.pagination);
      setAnalytics(analyticsResponse.data);
      setCustomers(customerResponse.data.items || []);
      setProducts(productResponse.data.items || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSalesData();
  }, []);

  const subtotal = useMemo(
    () => orderForm.orderItems.reduce((sum, item) => sum + Number(item.quantity || 0) * Number(item.price || 0), 0),
    [orderForm.orderItems],
  );

  const total = subtotal + Number(orderForm.taxAmount || 0) - Number(orderForm.discountAmount || 0);

  const updateLine = (index, field, value) => {
    setOrderForm((current) => {
      const nextItems = [...current.orderItems];
      const nextLine = { ...nextItems[index], [field]: value };
      if (field === 'product') {
        const product = products.find((entry) => entry._id === value);
        nextLine.name = product?.name || '';
        nextLine.price = product?.price || 0;
      }
      nextItems[index] = nextLine;
      return { ...current, orderItems: nextItems };
    });
  };

  const createOrder = async (event) => {
    event.preventDefault();
    await api.post('/sales/orders', orderForm);
    setOrderForm(blankOrder);
    setModalOpen(false);
    fetchSalesData();
  };

  const updateOrderStatus = async (orderId, status, paymentStatus) => {
    await api.put(`/sales/orders/${orderId}/status`, { status, paymentStatus });
    fetchOrders(page);
  };

  if (loading) {
    return <LoadingState label="Synchronizing order engine..." />;
  }

  return (
    <div className="space-y-6 pb-12">
      <PageHeader
        title="Revenue Operations"
        description="Monitor sales lifecycle, manage fulfillment pipelines, and keep track of commercial commitments."
        actions={<button className="primary-button inline-flex items-center gap-2" onClick={() => setModalOpen(true)}><Plus size={18} /> New Sales Order</button>}
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Periodic Revenue" value={formatCurrency(analytics?.totalRevenue || 0)} icon={<BarChart3 size={20} />} tone="success" />
        <MetricCard label="Total Volume" value={analytics?.totalOrders || 0} icon={<Package size={20} />} tone="primary" />
        <MetricCard label="Fulfilled" value={analytics?.deliveredOrders || 0} icon={<Truck size={20} />} tone="success" />
        <MetricCard label="In Pipeline" value={analytics?.pendingOrders || 0} icon={<Clock size={20} />} tone="warning" />
      </div>

      <Panel title="Order Fulfillment Queue" subtitle={getPaginationText(pagination)}>
        <div className="table-shell">
          <table>
            <thead>
              <tr>
                <th>Order Details</th>
                <th>Client Source</th>
                <th>Fulfillment</th>
                <th>Payment Status</th>
                <th>Financials</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order._id}>
                  <td>
                    <p className="font-bold text-text uppercase tracking-tighter">ORD-{order._id.slice(-6).toUpperCase()}</p>
                    <p className="text-[10px] text-muted font-bold mt-0.5">{formatDate(order.createdAt)}</p>
                  </td>
                  <td>
                    <p className="text-sm font-semibold text-text">{order.customer?.name || 'Private Entity'}</p>
                  </td>
                  <td><StatusBadge>{order.status}</StatusBadge></td>
                  <td><StatusBadge>{order.paymentStatus}</StatusBadge></td>
                  <td>
                    <p className="text-sm font-bold text-text">{formatCurrency(order.totalAmount)}</p>
                  </td>
                  <td>
                    <div className="flex justify-end gap-2">
                      <button className="secondary-button px-3 py-1.5 text-xs font-bold" onClick={() => updateOrderStatus(order._id, 'Shipped', order.paymentStatus)}>Set Shipped</button>
                      <button className="primary-button px-3 py-1.5 text-xs font-bold" onClick={() => updateOrderStatus(order._id, 'Delivered', 'Paid')}>Set Delivered</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Pagination pagination={pagination} onPageChange={(nextPage) => { setPage(nextPage); fetchOrders(nextPage); }} />
      </Panel>

      <Modal open={modalOpen} title="Generate Sales Order" onClose={() => setModalOpen(false)} width="max-w-5xl">
        <form className="space-y-6" onSubmit={createOrder}>
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-surface-muted p-4 rounded-xl border border-border">
                <h4 className="text-[10px] font-bold text-text uppercase tracking-widest mb-4 flex items-center gap-2">
                  <Package size={14} className="text-primary" /> Itemized Bill of Sale
                </h4>
                <div className="space-y-3">
                  {orderForm.orderItems.map((item, index) => (
                    <div key={index} className="grid grid-cols-[1fr_80px_120px_40px] gap-3 items-center">
                      <select 
                        className="h-10 text-sm font-medium"
                        value={item.product} 
                        onChange={(e) => updateLine(index, 'product', e.target.value)} 
                        required
                      >
                        <option value="">Select SKU...</option>
                        {products.map((p) => <option key={p._id} value={p._id}>{p.name} - {formatCurrency(p.price)}</option>)}
                      </select>
                      <input 
                        className="h-10 text-center text-sm font-bold"
                        type="number" 
                        min="1" 
                        value={item.quantity} 
                        onChange={(e) => updateLine(index, 'quantity', Number(e.target.value))} 
                        required 
                      />
                      <div className="h-10 flex items-center px-3 bg-surface border border-border rounded-lg text-sm font-bold text-text">
                        {formatCurrency(item.price * item.quantity)}
                      </div>
                      <button
                        type="button"
                        className="h-10 w-10 flex items-center justify-center text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                        onClick={() =>
                          setOrderForm((current) => {
                            const nextItems = current.orderItems.filter((_, i) => i !== index);
                            return { ...current, orderItems: nextItems.length ? nextItems : [createLine()] };
                          })
                        }
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                  <button 
                    type="button" 
                    className="w-full h-10 border border-dashed border-border text-[11px] font-bold text-muted uppercase tracking-widest hover:border-primary hover:text-primary transition-all rounded-xl mt-2" 
                    onClick={() => setOrderForm((current) => ({ ...current, orderItems: [...current.orderItems, createLine()] }))}
                  >
                    + Append New Line Item
                  </button>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <Panel title="Shipping Logistics" subtitle="Destination intelligence.">
                  <div className="space-y-4">
                    <div>
                      <label className="text-[10px] font-bold text-text uppercase mb-1 block">City</label>
                      <input value={orderForm.shippingAddress.city} onChange={(e) => setOrderForm(prev => ({ ...prev, shippingAddress: { ...prev.shippingAddress, city: e.target.value } }))} placeholder="Metropolis" />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-text uppercase mb-1 block">State / Region</label>
                      <input value={orderForm.shippingAddress.state} onChange={(e) => setOrderForm(prev => ({ ...prev, shippingAddress: { ...prev.shippingAddress, state: e.target.value } }))} placeholder="Province" />
                    </div>
                  </div>
                </Panel>
                <Panel title="Billing Configuration" subtitle="Payment and tax parameters.">
                  <div className="space-y-4">
                    <div>
                      <label className="text-[10px] font-bold text-text uppercase mb-1 block">Tax Adjustment</label>
                      <input type="number" min="0" value={orderForm.taxAmount} onChange={(e) => setOrderForm(prev => ({ ...prev, taxAmount: Number(e.target.value) }))} placeholder="0.00" />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-text uppercase mb-1 block">Total Discount</label>
                      <input type="number" min="0" value={orderForm.discountAmount} onChange={(e) => setOrderForm(prev => ({ ...prev, discountAmount: Number(e.target.value) }))} placeholder="0.00" />
                    </div>
                  </div>
                </Panel>
              </div>
            </div>

            <div className="space-y-6">
              <Panel title="Order Governance" subtitle="Client and payment details.">
                <div className="space-y-4">
                  <div>
                    <label className="text-[10px] font-bold text-text uppercase mb-1 block">Target Client</label>
                    <select className="h-10 font-medium" value={orderForm.customer} onChange={(e) => setOrderForm(prev => ({ ...prev, customer: e.target.value }))} required>
                      <option value="">Select entity...</option>
                      {customers.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-text uppercase mb-1 block">Settlement Method</label>
                    <select className="h-10 font-medium" value={orderForm.paymentMethod} onChange={(e) => setOrderForm(prev => ({ ...prev, paymentMethod: e.target.value }))}>
                      <option value="Bank Transfer">Commercial Wire</option>
                      <option value="Credit Card">Corporate Card</option>
                      <option value="Cash">Cash Ledger</option>
                    </select>
                  </div>
                </div>
              </Panel>

              <div className="bg-surface-strong p-6 rounded-2xl border border-border shadow-sm">
                <p className="text-[10px] font-bold text-muted uppercase tracking-widest mb-1">Commercial Subtotal</p>
                <p className="text-lg font-bold text-text mb-4">{formatCurrency(subtotal)}</p>
                
                <div className="pt-4 border-t border-border/10">
                  <p className="text-[10px] font-bold text-primary uppercase tracking-widest mb-1">Final Settlement Sum</p>
                  <p className="text-3xl font-black text-text tracking-tighter">{formatCurrency(total)}</p>
                </div>

                <div className="mt-6 space-y-3">
                  <button type="submit" className="primary-button w-full h-12 text-[11px] font-bold uppercase tracking-widest">Execute Order</button>
                  <button type="button" className="ghost-button w-full h-10 text-[11px] font-bold uppercase tracking-widest" onClick={() => setModalOpen(false)}>Discard</button>
                </div>
              </div>
            </div>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default OrderList;

