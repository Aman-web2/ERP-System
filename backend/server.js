const http = require('http');
const path = require('path');
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const { Server } = require('socket.io');

const connectDB = require('./config/db');

const { notFound, errorHandler } = require('./middleware/errorMiddleware');
const { setIo } = require('./utils/socket');

const authRoutes = require('./routes/authRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const employeeRoutes = require('./routes/employeeRoutes');
const departmentRoutes = require('./routes/departmentRoutes');
const leaveRoutes = require('./routes/leaveRoutes');
const attendanceRoutes = require('./routes/attendanceRoutes');
const inventoryRoutes = require('./routes/inventoryRoutes');
const crmRoutes = require('./routes/crmRoutes');
const salesRoutes = require('./routes/salesRoutes');
const financeRoutes = require('./routes/financeRoutes');
const taskRoutes = require('./routes/taskRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const documentRoutes = require('./routes/documentRoutes');
const settingsRoutes = require('./routes/settingsRoutes');
const reportRoutes = require('./routes/reportRoutes');
const searchRoutes = require('./routes/searchRoutes');
const auditRoutes = require('./routes/auditRoutes');
const contactRoutes = require('./routes/contactRoutes');

// Load environment variables FIRST
dotenv.config();

const app = express();
const server = http.createServer(app);

// =========================
// SOCKET.IO
// =========================

const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true
  }
});

setIo(io);

// =========================
// MIDDLEWARE
// =========================

app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true
  })
);

app.use(
  helmet({
    crossOriginResourcePolicy: false
  })
);

app.use(morgan('dev'));

app.use(express.json({ limit: '10mb' }));

app.use(
  express.urlencoded({
    extended: true
  })
);

app.use(cookieParser());

// Static uploads
app.use(
  '/uploads',
  express.static(path.join(__dirname, 'uploads'))
);

// =========================
// HEALTH CHECK
// =========================

app.get('/', (req, res) => {
  res.status(200).json({
    message: 'ERP API is running',
    status: 'ok'
  });
});

app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'ERP API is healthy'
  });
});

// =========================
// API ROUTES
// =========================

app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/leaves', leaveRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/crm', crmRoutes);
app.use('/api/sales', salesRoutes);
app.use('/api/finance', financeRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/audit', auditRoutes);
app.use('/api/contact', contactRoutes);

// =========================
// ERROR HANDLING
// =========================

app.use(notFound);
app.use(errorHandler);

// =========================
// SOCKET EVENTS
// =========================

io.on('connection', (socket) => {
  console.log(`Socket connected: ${socket.id}`);

  socket.on('disconnect', () => {
    console.log(`Socket disconnected: ${socket.id}`);
  });
});

// =========================
// START SERVER
// =========================

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // Connect MongoDB BEFORE starting server
    await connectDB();

    server.listen(PORT, '0.0.0.0', () => {
      console.log(
        `🚀 Server running in ${
          process.env.NODE_ENV || 'development'
        } mode on port ${PORT}`
      );
    });
  } catch (error) {
    console.error('❌ Server startup failed:', error.message);
    process.exit(1);
  }
};

startServer();