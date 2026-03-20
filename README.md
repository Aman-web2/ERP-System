# ERP System

Production-oriented MERN ERP with role-based access control, HR, inventory, CRM, sales, finance, tasks, notifications, documents, reports, and settings.

## Stack
- Frontend: React, Vite, Tailwind CSS, Recharts, Redux Toolkit, Axios, Socket.IO client
- Backend: Node.js, Express, MongoDB, Mongoose, JWT auth, Joi validation, Nodemailer, Cloudinary-ready uploads, Socket.IO

## Key modules
- Authentication with JWT cookies, OTP password reset, protected routes, role/module permissions
- Dashboard analytics with real aggregates, charts, alerts, recent activity
- HR workspace: employees, departments, designations, attendance, leaves
- Inventory: products, categories, suppliers, stock adjustments, low-stock alerts
- CRM: customers, purchase history, feedback
- Sales: orders, order status, automated invoice creation, sales analytics
- Finance: transactions, invoices with PDF export, payroll, profit/loss summary
- Tasks: kanban workflow, assignment, comments
- Notifications: in-app feed plus Socket.IO real-time events
- Documents: upload and manage ERP documents with Cloudinary fallback to local storage
- Reports: JSON preview plus PDF/Excel export for employees, inventory, sales, finance
- Settings: company profile, theme, permission matrix

## Project structure
- `backend/`: Express API, MVC-style controllers/routes/models, utilities, seed script
- `frontend/`: React application with module pages, protected layout, admin UI
- `docs/API.md`: API reference summary

## Local setup
1. Install dependencies
   - `cd backend && npm install`
   - `cd frontend && npm install`
2. Create environment files
   - Copy `backend/.env.example` to `backend/.env`
   - Copy `frontend/.env.example` to `frontend/.env`
3. Seed demo data
   - `cd backend && npm run seed`
4. Start the backend
   - `cd backend && npm run dev`
5. Start the frontend
   - `cd frontend && npm run dev`

## Demo accounts
- `admin@erp.local / Admin@123`
- `hr@erp.local / Hr@12345`
- `accounts@erp.local / Accounts@123`
- `employee@erp.local / Employee@123`

## Build verification
- Backend syntax check completed with `node --check`
- Frontend production build completed with `npm run build`

## Notes
- Email OTP works with SMTP config; without SMTP, the backend falls back to a local JSON transport and returns the OTP in non-production mode.
- Document upload uses Cloudinary when credentials are configured; otherwise files are stored locally under `backend/uploads`.
