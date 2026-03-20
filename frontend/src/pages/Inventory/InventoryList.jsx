import { useEffect, useMemo, useState } from 'react';
import { Boxes, Factory, PackagePlus, TriangleAlert } from 'lucide-react';
import api from '../../utils/axiosInstance';
import PageHeader from '../../components/ui/PageHeader';
import Panel from '../../components/ui/Panel';
import Modal from '../../components/ui/Modal';
import StatusBadge from '../../components/ui/StatusBadge';
import Pagination from '../../components/ui/Pagination';
import MetricCard from '../../components/ui/MetricCard';
import LoadingState from '../../components/ui/LoadingState';
import { formatCurrency, getPaginationText } from '../../utils/formatters';

const blankProduct = {
  name: '',
  sku: '',
  category: '',
  supplier: '',
  price: 0,
  costPrice: 0,
  quantity: 0,
  lowStockThreshold: 5,
  description: '',
};

const InventoryList = () => {
  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [categories, setCategories] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [productModal, setProductModal] = useState(false);
  const [stockModal, setStockModal] = useState({ open: false, product: null });
  const [productForm, setProductForm] = useState(blankProduct);
  const [stockForm, setStockForm] = useState({ type: 'IN', quantity: 1, remarks: '' });
  const [categoryForm, setCategoryForm] = useState({ name: '', description: '' });
  const [supplierForm, setSupplierForm] = useState({ name: '', contactPerson: '', email: '', phone: '', address: '' });

  const fetchProducts = async (nextPage = page, query = search) => {
    const { data } = await api.get(`/inventory/products?page=${nextPage}&limit=8&search=${encodeURIComponent(query)}`);
    setProducts(data.items || []);
    setPagination(data.pagination);
  };

  const fetchInventory = async () => {
    setLoading(true);
    try {
      const [categoryResponse, supplierResponse] = await Promise.all([
        api.get('/inventory/categories'),
        api.get('/inventory/suppliers'),
      ]);
      await fetchProducts();
      setCategories(categoryResponse.data);
      setSuppliers(supplierResponse.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchProducts(1, search);
      setPage(1);
    }, 350);
    return () => clearTimeout(timer);
  }, [search]);

  const inventoryStats = useMemo(() => ({
    totalValue: products.reduce((sum, product) => sum + product.price * product.quantity, 0),
    lowStock: products.filter((product) => ['Low Stock', 'Out of Stock'].includes(product.status)).length,
    categories: categories.length,
    suppliers: suppliers.length,
  }), [products, categories, suppliers]);

  const createProduct = async (event) => {
    event.preventDefault();
    await api.post('/inventory/products', productForm);
    setProductForm(blankProduct);
    setProductModal(false);
    fetchProducts(page, search);
  };

  const createCategory = async (event) => {
    event.preventDefault();
    await api.post('/inventory/categories', categoryForm);
    setCategoryForm({ name: '', description: '' });
    fetchInventory();
  };

  const createSupplier = async (event) => {
    event.preventDefault();
    await api.post('/inventory/suppliers', supplierForm);
    setSupplierForm({ name: '', contactPerson: '', email: '', phone: '', address: '' });
    fetchInventory();
  };

  const adjustStock = async (event) => {
    event.preventDefault();
    await api.post(`/inventory/products/${stockModal.product._id}/stock`, stockForm);
    setStockModal({ open: false, product: null });
    setStockForm({ type: 'IN', quantity: 1, remarks: '' });
    fetchProducts(page, search);
  };

  if (loading) {
    return <LoadingState label="Loading inventory operations..." />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Inventory operations"
        description="Track catalog, suppliers, stock levels, and low-stock interventions with a single inventory console."
        actions={<button className="primary-button inline-flex items-center gap-2" onClick={() => setProductModal(true)}><PackagePlus size={18} /> Add product</button>}
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Inventory value" value={formatCurrency(inventoryStats.totalValue)} icon={<Boxes size={22} />} tone="primary" />
        <MetricCard label="Low stock" value={inventoryStats.lowStock} icon={<TriangleAlert size={22} />} tone="warning" />
        <MetricCard label="Categories" value={inventoryStats.categories} icon={<Boxes size={22} />} tone="success" />
        <MetricCard label="Suppliers" value={inventoryStats.suppliers} icon={<Factory size={22} />} tone="danger" />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
        <Panel title="Product catalog" subtitle={getPaginationText(pagination)} actions={<input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search products or SKU" className="max-w-sm" />}>
          <div className="table-shell">
            <table>
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Category</th>
                  <th>Supplier</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>Status</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product._id}>
                    <td>
                      <p className="font-medium text-[var(--text)]">{product.name}</p>
                      <p className="text-sm text-[var(--muted)]">{product.sku}</p>
                    </td>
                    <td>{product.category?.name || 'Uncategorized'}</td>
                    <td>{product.supplier?.name || 'N/A'}</td>
                    <td>{formatCurrency(product.price)}</td>
                    <td>{product.quantity}</td>
                    <td><StatusBadge>{product.status}</StatusBadge></td>
                    <td>
                      <button className="secondary-button px-3 py-2" onClick={() => setStockModal({ open: true, product })}>Adjust stock</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination pagination={pagination} onPageChange={(nextPage) => { setPage(nextPage); fetchProducts(nextPage, search); }} />
        </Panel>

        <div className="space-y-6">
          <Panel title="Category management" subtitle="Maintain inventory groupings.">
            <form className="space-y-3" onSubmit={createCategory}>
              <input value={categoryForm.name} onChange={(event) => setCategoryForm((current) => ({ ...current, name: event.target.value }))} placeholder="Category name" required />
              <textarea rows="3" value={categoryForm.description} onChange={(event) => setCategoryForm((current) => ({ ...current, description: event.target.value }))} placeholder="Description" />
              <button type="submit" className="primary-button">Create category</button>
            </form>
            <div className="mt-4 space-y-2">
              {categories.map((category) => (
                <div key={category._id} className="rounded-2xl bg-[var(--surface-muted)] px-4 py-3 text-sm text-[var(--text)]">{category.name}</div>
              ))}
            </div>
          </Panel>

          <Panel title="Supplier management" subtitle="Maintain vendor relationships and contact details.">
            <form className="space-y-3" onSubmit={createSupplier}>
              <input value={supplierForm.name} onChange={(event) => setSupplierForm((current) => ({ ...current, name: event.target.value }))} placeholder="Supplier name" required />
              <div className="field-grid two">
                <input value={supplierForm.contactPerson} onChange={(event) => setSupplierForm((current) => ({ ...current, contactPerson: event.target.value }))} placeholder="Contact person" />
                <input value={supplierForm.phone} onChange={(event) => setSupplierForm((current) => ({ ...current, phone: event.target.value }))} placeholder="Phone" required />
              </div>
              <input type="email" value={supplierForm.email} onChange={(event) => setSupplierForm((current) => ({ ...current, email: event.target.value }))} placeholder="Email" required />
              <textarea rows="3" value={supplierForm.address} onChange={(event) => setSupplierForm((current) => ({ ...current, address: event.target.value }))} placeholder="Address" />
              <button type="submit" className="primary-button">Save supplier</button>
            </form>
          </Panel>
        </div>
      </div>

      <Modal open={productModal} title="Add product" onClose={() => setProductModal(false)}>
        <form className="field-grid two" onSubmit={createProduct}>
          <input value={productForm.name} onChange={(event) => setProductForm((current) => ({ ...current, name: event.target.value }))} placeholder="Product name" required />
          <input value={productForm.sku} onChange={(event) => setProductForm((current) => ({ ...current, sku: event.target.value }))} placeholder="SKU" required />
          <select value={productForm.category} onChange={(event) => setProductForm((current) => ({ ...current, category: event.target.value }))} required>
            <option value="">Select category</option>
            {categories.map((category) => <option key={category._id} value={category._id}>{category.name}</option>)}
          </select>
          <select value={productForm.supplier} onChange={(event) => setProductForm((current) => ({ ...current, supplier: event.target.value }))}>
            <option value="">Select supplier</option>
            {suppliers.map((supplier) => <option key={supplier._id} value={supplier._id}>{supplier.name}</option>)}
          </select>
          <input type="number" value={productForm.price} onChange={(event) => setProductForm((current) => ({ ...current, price: Number(event.target.value) }))} placeholder="Selling price" required />
          <input type="number" value={productForm.costPrice} onChange={(event) => setProductForm((current) => ({ ...current, costPrice: Number(event.target.value) }))} placeholder="Cost price" required />
          <input type="number" value={productForm.quantity} onChange={(event) => setProductForm((current) => ({ ...current, quantity: Number(event.target.value) }))} placeholder="Quantity" required />
          <input type="number" value={productForm.lowStockThreshold} onChange={(event) => setProductForm((current) => ({ ...current, lowStockThreshold: Number(event.target.value) }))} placeholder="Low stock threshold" required />
          <textarea className="col-span-full" rows="4" value={productForm.description} onChange={(event) => setProductForm((current) => ({ ...current, description: event.target.value }))} placeholder="Description" />
          <div className="col-span-full flex justify-end gap-3">
            <button type="button" className="ghost-button" onClick={() => setProductModal(false)}>Cancel</button>
            <button type="submit" className="primary-button">Save product</button>
          </div>
        </form>
      </Modal>

      <Modal open={stockModal.open} title={`Adjust stock${stockModal.product ? `: ${stockModal.product.name}` : ''}`} onClose={() => setStockModal({ open: false, product: null })} width="max-w-xl">
        <form className="space-y-4" onSubmit={adjustStock}>
          <select value={stockForm.type} onChange={(event) => setStockForm((current) => ({ ...current, type: event.target.value }))}>
            <option value="IN">Stock in</option>
            <option value="OUT">Stock out</option>
            <option value="ADJUSTMENT">Set exact quantity</option>
          </select>
          <input type="number" min="1" value={stockForm.quantity} onChange={(event) => setStockForm((current) => ({ ...current, quantity: Number(event.target.value) }))} />
          <textarea rows="4" value={stockForm.remarks} onChange={(event) => setStockForm((current) => ({ ...current, remarks: event.target.value }))} placeholder="Remarks" />
          <div className="flex justify-end gap-3">
            <button type="button" className="ghost-button" onClick={() => setStockModal({ open: false, product: null })}>Cancel</button>
            <button type="submit" className="primary-button">Apply adjustment</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default InventoryList;

