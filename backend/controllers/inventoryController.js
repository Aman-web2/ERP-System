const asyncHandler = require('express-async-handler');
const Product = require('../models/Product');
const Category = require('../models/Category');
const Supplier = require('../models/Supplier');
const StockMovement = require('../models/StockMovement');
const { validatePayload } = require('../utils/validate');
const { inventorySchemas } = require('../validators/schemas');
const { buildListOptions, sendPaginatedResponse } = require('../utils/pagination');
const { createNotification } = require('../services/notificationService');
const { logAction } = require('../services/auditService');
const { ROLES } = require('../constants/roles');

const productPopulate = [
  { path: 'category', select: 'name' },
  { path: 'supplier', select: 'name email' }
];

const notifyIfLowStock = async (product, actorId) => {
  if (product.quantity <= product.lowStockThreshold) {
    await createNotification({
      title: 'Low stock alert',
      message: `${product.name} is at ${product.quantity} unit(s).`,
      type: 'warning',
      module: 'inventory',
      recipientRoles: [ROLES.ADMIN, ROLES.ACCOUNTANT],
      createdBy: actorId,
      actionUrl: '/inventory'
    });
  }
};

const getProducts = asyncHandler(async (req, res) => {
  const { search } = buildListOptions(req.query);
  const filter = {};

  if (req.query.category) {
    filter.category = req.query.category;
  }

  if (req.query.status) {
    filter.status = req.query.status;
  }

  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { sku: { $regex: search, $options: 'i' } }
    ];
  }

  const result = await sendPaginatedResponse({
    model: Product,
    filter,
    query: req.query,
    populate: productPopulate
  });

  res.json(result);
});

const createProduct = asyncHandler(async (req, res) => {
  const payload = validatePayload(inventorySchemas.product, req.body);
  const product = await Product.create(payload);
  await logAction('CREATE', 'Product', product._id, req.user._id, `Added new product: ${product.name}`);

  if (payload.quantity > 0) {
    await StockMovement.create({
      product: product._id,
      type: 'IN',
      quantity: payload.quantity,
      remarks: 'Initial stock',
      performedBy: req.user._id
    });
  }

  await notifyIfLowStock(product, req.user._id);

  res.status(201).json(await Product.findById(product._id).populate(productPopulate));
});

const updateProduct = asyncHandler(async (req, res) => {
  const payload = validatePayload(inventorySchemas.product, req.body);
  const product = await Product.findById(req.params.id);

  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  const previousQuantity = product.quantity;
  Object.assign(product, payload);
  await product.save();
  await logAction('UPDATE', 'Product', product._id, req.user._id, `Updated product details: ${product.name}`);

  const quantityDifference = product.quantity - previousQuantity;
  if (quantityDifference !== 0) {
    await StockMovement.create({
      product: product._id,
      type: quantityDifference > 0 ? 'IN' : 'OUT',
      quantity: Math.abs(quantityDifference),
      remarks: 'Quantity updated from product edit',
      performedBy: req.user._id
    });
  }

  await notifyIfLowStock(product, req.user._id);
  res.json(await Product.findById(product._id).populate(productPopulate));
});

const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  const name = product.name;
  await product.deleteOne();
  await logAction('DELETE', 'Product', req.params.id, req.user._id, `Removed product: ${name}`);
  res.json({ message: 'Product removed' });
});

const adjustStock = asyncHandler(async (req, res) => {
  const payload = validatePayload(inventorySchemas.stockMovement, req.body);
  const product = await Product.findById(req.params.id);

  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  if (payload.type === 'OUT' && payload.quantity > product.quantity) {
    res.status(400);
    throw new Error('Insufficient stock for stock out operation');
  }

  if (payload.type === 'IN') {
    product.quantity += payload.quantity;
  } else if (payload.type === 'OUT') {
    product.quantity -= payload.quantity;
  } else {
    product.quantity = payload.quantity;
  }

  await product.save();

  const movement = await StockMovement.create({
    product: product._id,
    ...payload,
    performedBy: req.user._id
  });

  await notifyIfLowStock(product, req.user._id);
  await logAction('UPDATE', 'Product Stock', product._id, req.user._id, `Adjusted stock for ${product.name} (Type: ${payload.type}, Qty: ${payload.quantity})`);

  res.status(201).json({
    movement,
    product
  });
});

const getStockMovements = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.product) {
    filter.product = req.query.product;
  }

  const result = await sendPaginatedResponse({
    model: StockMovement,
    filter,
    query: req.query,
    populate: [
      { path: 'product', select: 'name sku' },
      { path: 'performedBy', select: 'name' }
    ]
  });

  res.json(result);
});

const getCategories = asyncHandler(async (req, res) => {
  res.json(await Category.find({}).sort('name'));
});

const createCategory = asyncHandler(async (req, res) => {
  const payload = validatePayload(inventorySchemas.category, req.body);
  const category = await Category.create(payload);
  res.status(201).json(category);
});

const updateCategory = asyncHandler(async (req, res) => {
  const payload = validatePayload(inventorySchemas.category, req.body);
  const category = await Category.findByIdAndUpdate(req.params.id, payload, { new: true, runValidators: true });

  if (!category) {
    res.status(404);
    throw new Error('Category not found');
  }

  res.json(category);
});

const deleteCategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);
  if (!category) {
    res.status(404);
    throw new Error('Category not found');
  }

  await category.deleteOne();
  res.json({ message: 'Category removed' });
});

const getSuppliers = asyncHandler(async (req, res) => {
  res.json(await Supplier.find({}).sort('name'));
});

const createSupplier = asyncHandler(async (req, res) => {
  const payload = validatePayload(inventorySchemas.supplier, req.body);
  const supplier = await Supplier.create(payload);
  res.status(201).json(supplier);
});

const updateSupplier = asyncHandler(async (req, res) => {
  const payload = validatePayload(inventorySchemas.supplier, req.body);
  const supplier = await Supplier.findByIdAndUpdate(req.params.id, payload, { new: true, runValidators: true });

  if (!supplier) {
    res.status(404);
    throw new Error('Supplier not found');
  }

  res.json(supplier);
});

const deleteSupplier = asyncHandler(async (req, res) => {
  const supplier = await Supplier.findById(req.params.id);
  if (!supplier) {
    res.status(404);
    throw new Error('Supplier not found');
  }

  await supplier.deleteOne();
  res.json({ message: 'Supplier removed' });
});

module.exports = {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  adjustStock,
  getStockMovements,
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  getSuppliers,
  createSupplier,
  updateSupplier,
  deleteSupplier
};

