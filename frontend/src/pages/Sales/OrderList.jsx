import { useEffect, useMemo, useState } from 'react';
import { BarChart3, Plus, Truck } from 'lucide-react';
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
    const { data } = await api.get(`/sales/orders?page=${nextPage}&limit=8`);
    setOrders(data.items || []);
    setPagination(data.pagination);
  };

  const fetchSalesData = async () => {
    setLoading(true);
    try {
      const [ordersResponse, analyticsResponse, customerResponse, productResponse] = await Promise.all([
        api.get('/sales/orders?page=1&limit=8'),
        api.get('/sales/analytics'),
        api.get('/crm/customers?limit=50'),
        api.get('/inventory/products?limit=50'),
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
    return <LoadingState label="Loading sales engine..." />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Sales and orders"
        description="Create orders, track fulfilment, and keep billing aligned with finance through automated invoice generation."
        actions={<button className="primary-button inline-flex items-center gap-2" onClick={() => setModalOpen(true)}><Plus size={18} /> New order</button>}
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Total revenue" value={formatCurrency(analytics?.totalRevenue || 0)} icon={<BarChart3 size={20} />} tone="success" />
        <MetricCard label="Orders" value={analytics?.totalOrders || 0} icon={<Truck size={20} />} tone="primary" />
        <MetricCard label="Delivered" value={analytics?.deliveredOrders || 0} icon={<Truck size={20} />} tone="success" />
        <MetricCard label="Pending" value={analytics?.pendingOrders || 0} icon={<Truck size={20} />} tone="warning" />
      </div>

      <Panel title="Order pipeline" subtitle={getPaginationText(pagination)}>
        <div className="table-shell">
          <table>
            <thead>
              <tr>
                <th>Order</th>
                <th>Customer</th>
                <th>Status</th>
                <th>Payment</th>
                <th>Total</th>
                <th>Update</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order._id}>
                  <td>
                    <p className="font-medium text-[var(--text)]">Order {order._id.slice(-6).toUpperCase()}</p>
                    <p className="text-sm text-[var(--muted)]">{formatDate(order.createdAt)}</p>
                  </td>
                  <td>{order.customer?.name || 'Unknown'}</td>
                  <td><StatusBadge>{order.status}</StatusBadge></td>
                  <td><StatusBadge>{order.paymentStatus}</StatusBadge></td>
                  <td>{formatCurrency(order.totalAmount)}</td>
                  <td>
                    <div className="flex flex-wrap gap-2">
                      <button className="secondary-button px-3 py-2" onClick={() => updateOrderStatus(order._id, 'Shipped', order.paymentStatus)}>Ship</button>
                      <button className="primary-button px-3 py-2" onClick={() => updateOrderStatus(order._id, 'Delivered', 'Paid')}>Deliver</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Pagination pagination={pagination} onPageChange={(nextPage) => { setPage(nextPage); fetchOrders(nextPage); }} />
      </Panel>

      <Modal open={modalOpen} title="Create order" onClose={() => setModalOpen(false)} width="max-w-4xl">
        <form className="space-y-5" onSubmit={createOrder}>
          <div className="field-grid two">
            <select value={orderForm.customer} onChange={(event) => setOrderForm((current) => ({ ...current, customer: event.target.value }))} required>
              <option value="">Select customer</option>
              {customers.map((customer) => <option key={customer._id} value={customer._id}>{customer.name}</option>)}
            </select>
            <select value={orderForm.paymentMethod} onChange={(event) => setOrderForm((current) => ({ ...current, paymentMethod: event.target.value }))}>
              <option value="Bank Transfer">Bank Transfer</option>
              <option value="Credit Card">Credit Card</option>
              <option value="Cash">Cash</option>
            </select>
          </div>

          <div className="space-y-3">
            {orderForm.orderItems.map((item, index) => (
              <div key={`line-${index}`} className="grid gap-3 rounded-3xl border border-[var(--border)] p-4 lg:grid-cols-[2fr_1fr_1fr_auto]">
                <select value={item.product} onChange={(event) => updateLine(index, 'product', event.target.value)} required>
                  <option value="">Select product</option>
                  {products.map((product) => <option key={product._id} value={product._id}>{product.name}</option>)}
                </select>
                <input type="number" min="1" value={item.quantity} onChange={(event) => updateLine(index, 'quantity', Number(event.target.value))} required />
                <input type="number" min="0" value={item.price} onChange={(event) => updateLine(index, 'price', Number(event.target.value))} required />
                <button
                  type="button"
                  className="ghost-button"
                  onClick={() =>
                    setOrderForm((current) => {
                      const nextItems = current.orderItems.filter((_, lineIndex) => lineIndex !== index);
                      return { ...current, orderItems: nextItems.length ? nextItems : [createLine()] };
                    })
                  }
                >
                  Remove
                </button>
              </div>
            ))}
            <button type="button" className="secondary-button" onClick={() => setOrderForm((current) => ({ ...current, orderItems: [...current.orderItems, createLine()] }))}>Add line item</button>
          </div>

          <div className="field-grid two">
            <input type="number" min="0" value={orderForm.taxAmount} onChange={(event) => setOrderForm((current) => ({ ...current, taxAmount: Number(event.target.value) }))} placeholder="Tax amount" />
            <input type="number" min="0" value={orderForm.discountAmount} onChange={(event) => setOrderForm((current) => ({ ...current, discountAmount: Number(event.target.value) }))} placeholder="Discount amount" />
            <input value={orderForm.shippingAddress.city} onChange={(event) => setOrderForm((current) => ({ ...current, shippingAddress: { ...current.shippingAddress, city: event.target.value } }))} placeholder="City" />
            <input value={orderForm.shippingAddress.state} onChange={(event) => setOrderForm((current) => ({ ...current, shippingAddress: { ...current.shippingAddress, state: event.target.value } }))} placeholder="State" />
          </div>

          <div className="rounded-3xl bg-[var(--surface-muted)] px-5 py-4">
            <p className="text-sm text-[var(--muted)]">Subtotal {formatCurrency(subtotal)}</p>
            <p className="mt-2 text-2xl font-semibold text-[var(--text)]">Order total {formatCurrency(total)}</p>
          </div>

          <div className="flex justify-end gap-3">
            <button type="button" className="ghost-button" onClick={() => setModalOpen(false)}>Cancel</button>
            <button type="submit" className="primary-button">Create order</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default OrderList;

