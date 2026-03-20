# API Summary

## Auth
- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/profile`
- `POST /api/auth/forgotpassword`
- `POST /api/auth/resetpassword`

## Dashboard
- `GET /api/dashboard/summary`

## HR
- `GET /api/employees`
- `POST /api/employees`
- `GET /api/employees/:id`
- `PUT /api/employees/:id`
- `DELETE /api/employees/:id`
- `GET /api/departments`
- `POST /api/departments`
- `PUT /api/departments/:id`
- `DELETE /api/departments/:id`
- `GET /api/departments/designations`
- `POST /api/departments/designations`
- `PUT /api/departments/designations/:id`
- `DELETE /api/departments/designations/:id`
- `POST /api/attendance/clock-in`
- `POST /api/attendance/clock-out`
- `GET /api/attendance`
- `GET /api/attendance/my`
- `POST /api/leaves`
- `GET /api/leaves`
- `GET /api/leaves/my`
- `PUT /api/leaves/:id/status`

## Inventory
- `GET /api/inventory/products`
- `POST /api/inventory/products`
- `PUT /api/inventory/products/:id`
- `DELETE /api/inventory/products/:id`
- `POST /api/inventory/products/:id/stock`
- `GET /api/inventory/movements`
- `GET /api/inventory/categories`
- `POST /api/inventory/categories`
- `PUT /api/inventory/categories/:id`
- `DELETE /api/inventory/categories/:id`
- `GET /api/inventory/suppliers`
- `POST /api/inventory/suppliers`
- `PUT /api/inventory/suppliers/:id`
- `DELETE /api/inventory/suppliers/:id`

## CRM and Sales
- `GET /api/crm/customers`
- `POST /api/crm/customers`
- `GET /api/crm/customers/:id`
- `PUT /api/crm/customers/:id`
- `DELETE /api/crm/customers/:id`
- `POST /api/crm/customers/:id/feedback`
- `GET /api/sales/orders`
- `POST /api/sales/orders`
- `GET /api/sales/orders/:id`
- `PUT /api/sales/orders/:id/status`
- `GET /api/sales/analytics`

## Finance
- `GET /api/finance/summary`
- `GET /api/finance/transactions`
- `POST /api/finance/transactions`
- `DELETE /api/finance/transactions/:id`
- `GET /api/finance/invoices`
- `POST /api/finance/invoices`
- `PUT /api/finance/invoices/:id/status`
- `GET /api/finance/invoices/:id/pdf`
- `GET /api/finance/payrolls`
- `POST /api/finance/payrolls`
- `PUT /api/finance/payrolls/:id/status`

## Tasks, docs, notifications, reports
- `GET /api/tasks`
- `POST /api/tasks`
- `PUT /api/tasks/:id`
- `DELETE /api/tasks/:id`
- `POST /api/tasks/:id/comments`
- `GET /api/documents`
- `POST /api/documents`
- `DELETE /api/documents/:id`
- `GET /api/notifications`
- `POST /api/notifications`
- `PUT /api/notifications/:id/read`
- `GET /api/reports/:type?format=pdf|xlsx`
- `GET /api/search?q=`
- `GET /api/settings`
- `PUT /api/settings`
