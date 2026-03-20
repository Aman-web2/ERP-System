const { Joi } = require('../utils/validate');
const { ALL_ROLES } = require('../constants/roles');

const objectId = Joi.string().length(24).hex();
const optionalObjectId = objectId.allow(null).empty('');
const emailField = Joi.string().email({ tlds: { allow: false } });

const authSchemas = {
  register: Joi.object({
    name: Joi.string().trim().min(3).max(120).required(),
    email: emailField.required(),
    password: Joi.string().min(6).max(128).required(),
    role: Joi.string().valid(...ALL_ROLES).optional(),
    phone: Joi.string().allow('', null).optional()
  }),
  login: Joi.object({
    email: emailField.required(),
    password: Joi.string().required()
  }),
  forgotPassword: Joi.object({
    email: emailField.required()
  }),
  resetPassword: Joi.object({
    email: emailField.required(),
    otp: Joi.string().length(6).required(),
    newPassword: Joi.string().min(6).max(128).required()
  })
};

const employeeSchemas = {
  create: Joi.object({
    name: Joi.string().trim().min(3).max(120).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).max(128).required(),
    role: Joi.string().valid(...ALL_ROLES).required(),
    department: optionalObjectId,
    designation: optionalObjectId,
    salary: Joi.number().min(0).default(0),
    phone: Joi.string().allow('', null),
    avatar: Joi.string().uri().allow('', null),
    dateOfJoining: Joi.date().optional()
  }),
  update: Joi.object({
    name: Joi.string().trim().min(3).max(120).optional(),
    email: emailField.optional(),
    password: Joi.string().min(6).max(128).optional(),
    role: Joi.string().valid(...ALL_ROLES).optional(),
    department: optionalObjectId,
    designation: optionalObjectId,
    salary: Joi.number().min(0).optional(),
    phone: Joi.string().allow('', null).optional(),
    avatar: Joi.string().uri().allow('', null).optional(),
    isActive: Joi.boolean().optional(),
    dateOfJoining: Joi.date().optional()
  })
};

const departmentSchemas = {
  department: Joi.object({
    name: Joi.string().trim().min(2).max(120).required(),
    description: Joi.string().allow('', null),
    manager: optionalObjectId
  }),
  designation: Joi.object({
    title: Joi.string().trim().min(2).max(120).required(),
    department: objectId.required(),
    description: Joi.string().allow('', null)
  })
};

const attendanceSchemas = {
  clock: Joi.object({
    notes: Joi.string().allow('', null)
  })
};

const leaveSchemas = {
  apply: Joi.object({
    leaveType: Joi.string().valid('Annual', 'Sick', 'Casual', 'Maternity', 'Paternity', 'Unpaid').required(),
    startDate: Joi.date().required(),
    endDate: Joi.date().min(Joi.ref('startDate')).required(),
    reason: Joi.string().trim().min(5).required()
  }),
  updateStatus: Joi.object({
    status: Joi.string().valid('Approved', 'Rejected').required(),
    adminComment: Joi.string().allow('', null)
  })
};

const inventorySchemas = {
  category: Joi.object({
    name: Joi.string().trim().min(2).max(120).required(),
    description: Joi.string().allow('', null)
  }),
  supplier: Joi.object({
    name: Joi.string().trim().min(2).max(120).required(),
    contactPerson: Joi.string().allow('', null),
    email: emailField.required(),
    phone: Joi.string().required(),
    address: Joi.string().allow('', null),
    isActive: Joi.boolean().optional()
  }),
  product: Joi.object({
    name: Joi.string().trim().min(2).max(120).required(),
    sku: Joi.string().trim().min(2).max(64).required(),
    category: objectId.required(),
    supplier: optionalObjectId,
    price: Joi.number().min(0).required(),
    costPrice: Joi.number().min(0).required(),
    quantity: Joi.number().integer().min(0).required(),
    lowStockThreshold: Joi.number().integer().min(0).default(10),
    image: Joi.string().uri().allow('', null),
    description: Joi.string().allow('', null)
  }),
  stockMovement: Joi.object({
    type: Joi.string().valid('IN', 'OUT', 'ADJUSTMENT').required(),
    quantity: Joi.number().integer().positive().required(),
    remarks: Joi.string().allow('', null),
    reference: Joi.string().allow('', null)
  })
};

const customerSchemas = {
  create: Joi.object({
    name: Joi.string().trim().min(2).max(120).required(),
    email: emailField.required(),
    phone: Joi.string().required(),
    company: Joi.string().allow('', null),
    status: Joi.string().valid('Active', 'Lead', 'Inactive').default('Active'),
    notes: Joi.string().allow('', null),
    address: Joi.object({
      street: Joi.string().allow('', null),
      city: Joi.string().allow('', null),
      state: Joi.string().allow('', null),
      zipCode: Joi.string().allow('', null),
      country: Joi.string().allow('', null)
    }).default({})
  }),
  update: Joi.object({
    name: Joi.string().trim().min(2).max(120).optional(),
    email: emailField.optional(),
    phone: Joi.string().optional(),
    company: Joi.string().allow('', null).optional(),
    status: Joi.string().valid('Active', 'Lead', 'Inactive').optional(),
    notes: Joi.string().allow('', null).optional(),
    address: Joi.object({
      street: Joi.string().allow('', null),
      city: Joi.string().allow('', null),
      state: Joi.string().allow('', null),
      zipCode: Joi.string().allow('', null),
      country: Joi.string().allow('', null)
    }).optional()
  }),
  feedback: Joi.object({
    rating: Joi.number().integer().min(1).max(5).required(),
    comment: Joi.string().trim().min(3).required()
  })
};

const salesSchemas = {
  order: Joi.object({
    customer: objectId.required(),
    orderItems: Joi.array().items(Joi.object({
      product: objectId.required(),
      name: Joi.string().required(),
      quantity: Joi.number().integer().positive().required(),
      price: Joi.number().min(0).required()
    })).min(1).required(),
    shippingAddress: Joi.object({
      street: Joi.string().allow('', null),
      city: Joi.string().allow('', null),
      state: Joi.string().allow('', null),
      zipCode: Joi.string().allow('', null),
      country: Joi.string().allow('', null)
    }).default({}),
    paymentMethod: Joi.string().default('Bank Transfer'),
    paymentStatus: Joi.string().valid('Pending', 'Paid', 'Failed', 'Refunded').default('Pending'),
    status: Joi.string().valid('Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled').default('Pending'),
    estimatedDelivery: Joi.date().optional(),
    taxAmount: Joi.number().min(0).default(0),
    discountAmount: Joi.number().min(0).default(0)
  }),
  updateStatus: Joi.object({
    status: Joi.string().valid('Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled').optional(),
    paymentStatus: Joi.string().valid('Pending', 'Paid', 'Failed', 'Refunded').optional()
  })
};

const financeSchemas = {
  transaction: Joi.object({
    type: Joi.string().valid('Income', 'Expense').required(),
    amount: Joi.number().positive().required(),
    category: Joi.string().required(),
    description: Joi.string().required(),
    date: Joi.date().optional(),
    referenceId: Joi.string().allow('', null),
    status: Joi.string().valid('Completed', 'Pending', 'Failed').default('Completed')
  }),
  invoice: Joi.object({
    customer: objectId.required(),
    order: optionalObjectId,
    dueDate: Joi.date().required(),
    notes: Joi.string().allow('', null),
    status: Joi.string().valid('Unpaid', 'Paid', 'Partial', 'Overdue').default('Unpaid'),
    taxAmount: Joi.number().min(0).default(0),
    discountAmount: Joi.number().min(0).default(0),
    items: Joi.array().items(Joi.object({
      name: Joi.string().required(),
      quantity: Joi.number().positive().required(),
      price: Joi.number().min(0).required()
    })).min(1).required()
  }),
  payroll: Joi.object({
    employee: objectId.required(),
    month: Joi.number().integer().min(1).max(12).required(),
    year: Joi.number().integer().min(2020).max(2100).required(),
    basicSalary: Joi.number().min(0).required(),
    allowances: Joi.number().min(0).default(0),
    deductions: Joi.number().min(0).default(0),
    status: Joi.string().valid('Pending', 'Paid').default('Pending')
  })
};

const taskSchemas = {
  create: Joi.object({
    title: Joi.string().trim().min(3).max(200).required(),
    description: Joi.string().allow('', null),
    status: Joi.string().valid('To Do', 'In Progress', 'In Review', 'Done').default('To Do'),
    priority: Joi.string().valid('Low', 'Medium', 'High', 'Urgent').default('Medium'),
    dueDate: Joi.date().optional(),
    assignee: optionalObjectId
  }),
  update: Joi.object({
    title: Joi.string().trim().min(3).max(200).optional(),
    description: Joi.string().allow('', null).optional(),
    status: Joi.string().valid('To Do', 'In Progress', 'In Review', 'Done').optional(),
    priority: Joi.string().valid('Low', 'Medium', 'High', 'Urgent').optional(),
    dueDate: Joi.date().optional(),
    assignee: optionalObjectId.optional()
  }),
  comment: Joi.object({
    comment: Joi.string().trim().min(2).required()
  })
};

const settingsSchemas = {
  company: Joi.object({
    companyName: Joi.string().trim().min(2).max(140).required(),
    email: emailField.required(),
    phone: Joi.string().required(),
    website: Joi.string().uri().allow('', null),
    address: Joi.string().required(),
    currency: Joi.string().required(),
    taxId: Joi.string().allow('', null),
    theme: Joi.string().valid('light', 'dark').default('light'),
    permissions: Joi.object().pattern(Joi.string(), Joi.array().items(Joi.string())).optional()
  })
};

module.exports = {
  authSchemas,
  employeeSchemas,
  departmentSchemas,
  attendanceSchemas,
  leaveSchemas,
  inventorySchemas,
  customerSchemas,
  salesSchemas,
  financeSchemas,
  taskSchemas,
  settingsSchemas,
  objectId
};

