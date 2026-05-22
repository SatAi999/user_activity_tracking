require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

const authRoutes         = require('./routes/auth');
const taskRoutes         = require('./routes/tasks');
const adminRoutes        = require('./routes/admin');
const notificationRoutes = require('./routes/notifications');

connectDB();

const app = express();

const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:5175',
  'http://localhost:5176',
  process.env.CLIENT_URL,          // e.g. https://your-app.netlify.app
].filter(Boolean).map(o => o.replace(/\/$/, ''));

app.use(cors({
  origin: (origin, cb) => {
    // allow requests with no origin (curl, mobile apps) or from allowed list
    if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
    cb(new Error(`CORS: origin ${origin} not allowed`));
  },
  credentials: true,
}));
app.use(express.json());

// Routes
app.use('/api/auth',          authRoutes);
app.use('/api/tasks',         taskRoutes);
app.use('/api/admin',         adminRoutes);
app.use('/api/notifications', notificationRoutes);

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'OK' }));

// 404 handler
app.use((req, res) => res.status(404).json({ message: 'Route not found' }));

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Internal server error' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

