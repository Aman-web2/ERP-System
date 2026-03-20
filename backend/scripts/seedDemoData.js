require('dotenv').config();
const connectDB = require('../config/db');
const User = require('../models/User');
const Department = require('../models/Department');
const Designation = require('../models/Designation');
const Category = require('../models/Category');
const Supplier = require('../models/Supplier');
const Product = require('../models/Product');
const Customer = require('../models/Customer');
const Order = require('../models/Order');
const Invoice = require('../models/Invoice');
const Transaction = require('../models/Transaction');
const ProjectTask = require('../models/ProjectTask');
const Leave = require('../models/Leave');
const Attendance = require('../models/Attendance');
const Payroll = require('../models/Payroll');
const Notification = require('../models/Notification');
const CompanySetting = require('../models/CompanySetting');
const StockMovement = require('../models/StockMovement');
const Document = require('../models/Document');
const { DEFAULT_ROLE_PERMISSIONS, ROLES } = require('../constants/roles');

const seed = async () => {
  await connectDB();

  await Promise.all([
    User.deleteMany({}),
    Department.deleteMany({}),
    Designation.deleteMany({}),
    Category.deleteMany({}),
    Supplier.deleteMany({}),
    Product.deleteMany({}),
    Customer.deleteMany({}),
    Order.deleteMany({}),
    Invoice.deleteMany({}),
    Transaction.deleteMany({}),
    ProjectTask.deleteMany({}),
    Leave.deleteMany({}),
    Attendance.deleteMany({}),
    Payroll.deleteMany({}),
    Notification.deleteMany({}),
    CompanySetting.deleteMany({}),
    StockMovement.deleteMany({}),
    Document.deleteMany({})
  ]);

  const [engineering, financeDept, operations] = await Department.create([
    { name: 'Engineering', description: 'Product delivery and engineering operations' },
    { name: 'Finance', description: 'Accounting, compliance, and payroll' },
    { name: 'Operations', description: 'People operations and administration' }
  ]);

  const [softwareEngineer, financeManager, hrManager] = await Designation.create([
    { title: 'Software Engineer', department: engineering._id },
    { title: 'Finance Manager', department: financeDept._id },
    { title: 'HR Manager', department: operations._id }
  ]);

  const admin = await User.create({
    name: 'System Admin',
    email: 'admin@erp.local',
    password: 'Admin@123',
    role: ROLES.ADMIN,
    department: operations._id,
    designation: hrManager._id,
    phone: '+91 90000 00001',
    salary: 120000
  });

  const hr = await User.create({
    name: 'Priya Sharma',
    email: 'hr@erp.local',
    password: 'Hr@12345',
    role: ROLES.HR,
    department: operations._id,
    designation: hrManager._id,
    phone: '+91 90000 00002',
    salary: 85000
  });

  const accountant = await User.create({
    name: 'Arjun Mehta',
    email: 'accounts@erp.local',
    password: 'Accounts@123',
    role: ROLES.ACCOUNTANT,
    department: financeDept._id,
    designation: financeManager._id,
    phone: '+91 90000 00003',
    salary: 90000
  });

  const employee = await User.create({
    name: 'Riya Kapoor',
    email: 'employee@erp.local',
    password: 'Employee@123',
    role: ROLES.EMPLOYEE,
    department: engineering._id,
    designation: softwareEngineer._id,
    phone: '+91 90000 00004',
    salary: 65000
  });

  await CompanySetting.create({
    companyName: 'Scale ERP Pvt Ltd',
    email: 'hello@scaleerp.com',
    phone: '+91 98765 43210',
    website: 'https://scaleerp.example.com',
    address: 'Bengaluru, India',
    currency: 'INR',
    taxId: 'GSTIN-ERP-001',
    permissions: DEFAULT_ROLE_PERMISSIONS,
    theme: 'light'
  });

  const [hardware, office] = await Category.create([
    { name: 'Hardware', description: 'Physical IT assets and devices' },
    { name: 'Office Supplies', description: 'Consumables and office materials' }
  ]);

  const [supplierOne, supplierTwo] = await Supplier.create([
    { name: 'TechSource India', contactPerson: 'Kabir', email: 'kabir@techsource.test', phone: '+91 90000 00100', address: 'Mumbai' },
    { name: 'OfficeHub', contactPerson: 'Neha', email: 'neha@officehub.test', phone: '+91 90000 00101', address: 'Delhi' }
  ]);

  const [laptops, routers, notebooks] = await Product.create([
    { name: 'Dell Latitude 7440', sku: 'LAP-7440', category: hardware._id, supplier: supplierOne._id, price: 92000, costPrice: 81000, quantity: 8, lowStockThreshold: 3, description: 'Developer laptop' },
    { name: 'Cisco Meraki Router', sku: 'RTR-MERAKI', category: hardware._id, supplier: supplierOne._id, price: 24000, costPrice: 18000, quantity: 2, lowStockThreshold: 3, description: 'Branch office router' },
    { name: 'A5 Notebooks Pack', sku: 'OFF-NOTE', category: office._id, supplier: supplierTwo._id, price: 450, costPrice: 280, quantity: 25, lowStockThreshold: 5, description: 'Office stationery pack' }
  ]);

  await StockMovement.create([
    { product: laptops._id, type: 'IN', quantity: 8, remarks: 'Initial stock', performedBy: accountant._id },
    { product: routers._id, type: 'IN', quantity: 2, remarks: 'Initial stock', performedBy: accountant._id },
    { product: notebooks._id, type: 'IN', quantity: 25, remarks: 'Initial stock', performedBy: accountant._id }
  ]);

  const [customerOne, customerTwo] = await Customer.create([
    { name: 'Apex Retail', email: 'ops@apexretail.test', phone: '+91 90111 00111', company: 'Apex Retail', status: 'Active', notes: 'Enterprise account' },
    { name: 'Nimbus Labs', email: 'finance@nimbus.test', phone: '+91 90111 00112', company: 'Nimbus Labs', status: 'Lead', notes: 'Interested in annual subscription' }
  ]);

  const order = await Order.create({
    customer: customerOne._id,
    orderItems: [
      { product: laptops._id, name: laptops.name, quantity: 2, price: laptops.price },
      { product: routers._id, name: routers.name, quantity: 1, price: routers.price }
    ],
    shippingAddress: { city: 'Pune', state: 'Maharashtra', country: 'India' },
    paymentMethod: 'Bank Transfer',
    paymentStatus: 'Paid',
    totalAmount: 208000,
    taxAmount: 12000,
    discountAmount: 12000,
    status: 'Delivered',
    createdBy: accountant._id
  });

  const invoice = await Invoice.create({
    invoiceNumber: `INV-${Date.now()}`,
    customer: customerOne._id,
    order: order._id,
    items: order.orderItems.map((item) => ({ name: item.name, quantity: item.quantity, price: item.price })),
    subtotal: 208000,
    taxAmount: 12000,
    discountAmount: 12000,
    totalAmount: 208000,
    dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
    status: 'Paid',
    generatedBy: accountant._id
  });

  order.invoice = invoice._id;
  await order.save();

  await Transaction.create([
    { type: 'Income', amount: 208000, category: 'Sales', description: 'Apex Retail hardware order', status: 'Completed', addedBy: accountant._id, referenceId: order._id.toString() },
    { type: 'Expense', amount: 65000, category: 'Payroll', description: 'Salary payout for Riya Kapoor', status: 'Completed', addedBy: accountant._id },
    { type: 'Expense', amount: 18000, category: 'Operations', description: 'Office network maintenance', status: 'Completed', addedBy: admin._id }
  ]);

  await Payroll.create({
    employee: employee._id,
    month: 3,
    year: 2026,
    basicSalary: 65000,
    allowances: 5000,
    deductions: 3000,
    netSalary: 67000,
    status: 'Paid',
    paidAt: new Date(),
    processedBy: accountant._id
  });

  await ProjectTask.create([
    { title: 'Launch payroll dashboard', description: 'Finalize payroll review widgets.', status: 'In Progress', priority: 'High', dueDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000), assignee: accountant._id, createdBy: admin._id },
    { title: 'Complete leave approvals', description: 'Review pending leave requests for March.', status: 'To Do', priority: 'Medium', dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), assignee: hr._id, createdBy: admin._id },
    { title: 'Document onboarding SOP', description: 'Upload employee onboarding checklist.', status: 'In Review', priority: 'Low', dueDate: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000), assignee: employee._id, createdBy: hr._id }
  ]);

  await Leave.create({
    employee: employee._id,
    leaveType: 'Annual',
    startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    endDate: new Date(Date.now() + 9 * 24 * 60 * 60 * 1000),
    reason: 'Family trip planned in advance.',
    status: 'Pending'
  });

  await Attendance.create({
    employee: employee._id,
    date: new Date(),
    clockIn: new Date(),
    status: 'Present'
  });

  await Notification.create([
    { title: 'Low stock alert', message: 'Cisco Meraki Router inventory is below threshold.', type: 'warning', module: 'inventory', recipientRoles: [ROLES.ADMIN, ROLES.ACCOUNTANT], createdBy: accountant._id },
    { title: 'Pending leave review', message: 'Riya Kapoor submitted a new leave request.', type: 'info', module: 'leaves', recipientRoles: [ROLES.ADMIN, ROLES.HR], createdBy: hr._id }
  ]);

  console.log('Demo ERP data seeded successfully');
  console.log('Admin: admin@erp.local / Admin@123');
  console.log('HR: hr@erp.local / Hr@12345');
  console.log('Accountant: accounts@erp.local / Accounts@123');
  console.log('Employee: employee@erp.local / Employee@123');
  process.exit(0);
};

seed().catch((error) => {
  console.error(error);
  process.exit(1);
});

