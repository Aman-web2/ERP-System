import { useState, useEffect, useMemo } from 'react';
import { Boxes, Factory, PackagePlus, TriangleAlert, Search } from 'lucide-react';
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
    return <LoadingState label="Loading inventory workspace..." />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Inventory Management"
        description="Monitor stock levels, manage product catalog, and handle vendor relations."
        actions={<button className="primary-button inline-flex items-center gap-2" onClick={() => setProductModal(true)}><PackagePlus size={18} /> Add Product</button>}
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Inventory Value" value={formatCurrency(inventoryStats.totalValue)} icon={<Boxes size={20} />} tone="primary" />
        <MetricCard label="Stock Alerts" value={inventoryStats.lowStock} helper="Immediate attention" icon={<TriangleAlert size={20} />} tone="warning" />
        <MetricCard label="Total Categories" value={inventoryStats.categories} icon={<Boxes size={20} />} tone="success" />
        <MetricCard label="Vendor Partners" value={inventoryStats.suppliers} icon={<Factory size={20} />} tone="danger" />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
        <Panel 
          title="Product Catalog" 
          subtitle={getPaginationText(pagination)} 
          actions={
            <div className="relative group w-full max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted group-focus-within:text-primary transition-colors" size={16} />
              <input 
                value={search} 
                onChange={(event) => setSearch(event.target.value)} 
                placeholder="Search SKU or name..." 
                className="pl-10 h-10 text-sm" 
              />
            </div>
          }
        >
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
                      <p className="font-semibold text-text">{product.name}</p>
                      <p className="text-xs text-muted font-medium">{product.sku}</p>
                    </td>
                    <td>{product.category?.name || 'Uncategorized'}</td>
                    <td>{product.supplier?.name || 'N/A'}</td>
                    <td>{formatCurrency(product.price)}</td>
                    <td className="font-bold">{product.quantity}</td>
                    <td><StatusBadge>{product.status}</StatusBadge></td>
                    <td>
                      <button className="secondary-button px-3 py-1.5 text-xs font-bold" onClick={() => setStockModal({ open: true, product })}>Adjust stock</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination pagination={pagination} onPageChange={(nextPage) => { setPage(nextPage); fetchProducts(nextPage, search); }} />
        </Panel>

        <div className="space-y-6">
          <Panel title="Category Management" subtitle="Manage inventory classifications.">
            <form className="space-y-3" onSubmit={createCategory}>
              <div>
                <label className="text-xs font-semibold text-text mb-1 block">Category Name</label>
                <input value={categoryForm.name} onChange={(event) => setCategoryForm((current) => ({ ...current, name: event.target.value }))} placeholder="e.g. Raw Materials" required />
              </div>
              <div>
                <label className="text-xs font-semibold text-text mb-1 block">Description</label>
                <textarea rows="2" value={categoryForm.description} onChange={(event) => setCategoryForm((current) => ({ ...current, description: event.target.value }))} placeholder="Optional details..." />
              </div>
              <button type="submit" className="primary-button w-full">Create Category</button>
            </form>
            <div className="mt-4 flex flex-wrap gap-2">
              {categories.map((category) => (
                <div key={category._id} className="rounded-lg bg-surface-muted border border-border px-3 py-1.5 text-xs font-bold text-text uppercase tracking-wider">{category.name}</div>
              ))}
            </div>
          </Panel>

          <Panel title="Vendor Management" subtitle="Maintain relationship details.">
            <form className="space-y-3" onSubmit={createSupplier}>
              <div>
                <label className="text-xs font-semibold text-text mb-1 block">Supplier Name</label>
                <input value={supplierForm.name} onChange={(event) => setSupplierForm((current) => ({ ...current, name: event.target.value }))} placeholder="Company Name" required />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-text mb-1 block">Contact Person</label>
                  <input value={supplierForm.contactPerson} onChange={(event) => setSupplierForm((current) => ({ ...current, contactPerson: event.target.value }))} placeholder="Name" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-text mb-1 block">Phone</label>
                  <input value={supplierForm.phone} onChange={(event) => setSupplierForm((current) => ({ ...current, phone: event.target.value }))} placeholder="Number" required />
                </div>
              </div>
              <button type="submit" className="primary-button w-full">Add Supplier</button>
            </form>
          </Panel>
        </div>
      </div>

      <Modal open={productModal} title="Add New Product" onClose={() => setProductModal(false)}>
        <form className="field-grid two" onSubmit={createProduct}>
          <div>
            <label className="text-xs font-semibold text-text mb-1 block">Product Name</label>
            <input value={productForm.name} onChange={(event) => setProductForm((current) => ({ ...current, name: event.target.value }))} placeholder="e.g. Steel Pipe" required />
          </div>
          <div>
            <label className="text-xs font-semibold text-text mb-1 block">SKU</label>
            <input value={productForm.sku} onChange={(event) => setProductForm((current) => ({ ...current, sku: event.target.value }))} placeholder="SKU-001" required />
          </div>
          <div>
            <label className="text-xs font-semibold text-text mb-1 block">Category</label>
            <select value={productForm.category} onChange={(event) => setProductForm((current) => ({ ...current, category: event.target.value }))} required>
              <option value="">Select category</option>
              {categories.map((category) => <option key={category._id} value={category._id}>{category.name}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-text mb-1 block">Supplier</label>
            <select value={productForm.supplier} onChange={(event) => setProductForm((current) => ({ ...current, supplier: event.target.value }))}>
              <option value="">Select supplier</option>
              {suppliers.map((supplier) => <option key={supplier._id} value={supplier._id}>{supplier.name}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-text mb-1 block">Selling Price</label>
            <input type="number" value={productForm.price} onChange={(event) => setProductForm((current) => ({ ...current, price: Number(event.target.value) }))} required />
          </div>
          <div>
            <label className="text-xs font-semibold text-text mb-1 block">Quantity</label>
            <input type="number" value={productForm.quantity} onChange={(event) => setProductForm((current) => ({ ...current, quantity: Number(event.target.value) }))} required />
          </div>
          <div className="col-span-full pt-4 flex justify-end gap-3">
            <button type="button" className="ghost-button" onClick={() => setProductModal(false)}>Cancel</button>
            <button type="submit" className="primary-button">Save Product</button>
          </div>
        </form>
      </Modal>

      <Modal open={stockModal.open} title={`Stock Adjustment${stockModal.product ? `: ${stockModal.product.name}` : ''}`} onClose={() => setStockModal({ open: false, product: null })} width="max-w-md">
        <form className="space-y-4" onSubmit={adjustStock}>
          <div>
            <label className="text-xs font-semibold text-text mb-1 block">Adjustment Type</label>
            <select value={stockForm.type} onChange={(event) => setStockForm((current) => ({ ...current, type: event.target.value }))}>
              <option value="IN">Stock Arrival (+)</option>
              <option value="OUT">Stock Dispatch (-)</option>
              <option value="ADJUSTMENT">Manual Correction</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-text mb-1 block">Quantity</label>
            <input type="number" min="1" value={stockForm.quantity} onChange={(event) => setStockForm((current) => ({ ...current, quantity: Number(event.target.value) }))} />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" className="ghost-button" onClick={() => setStockModal({ open: false, product: null })}>Cancel</button>
            <button type="submit" className="primary-button">Apply Changes</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default InventoryList;

