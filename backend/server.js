const express = require('express');
const cors = require('cors');
const path = require('path');
const os = require('os');
require('dotenv').config();
const connectDB = require('./config/db');

const app = express();

connectDB();

// ============================================
// FIX 1: CORS - Allow requests from any origin
// on the local network (mobile devices, etc.)
// ============================================
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin) return callback(null, true);
    // Allow all origins in development / LAN
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Handle preflight requests explicitly
app.options('*', cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ============================================
// FIX 2: API info endpoint - helps frontend
// discover the correct server URL
// ============================================
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: Date.now() });
});

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/complaints', require('./routes/complaints'));
app.use('/api/cleaning', require('./routes/cleaning'));
app.use('/api/laundry', require('./routes/laundry'));
app.use('/api/mess', require('./routes/mess'));
app.use('/api/lostfound', require('./routes/lostfound'));
app.use('/api/notices', require('./routes/notices'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/worker', require('./routes/worker'));

// Serve frontend in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../frontend/build')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/build/index.html'));
  });
}

const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || '0.0.0.0';

// ============================================
// FIX 3: Bind to 0.0.0.0 so the server is
// reachable from other devices on the network
// ============================================
app.listen(PORT, HOST, () => {
  console.log(`\n✅ Server running on port ${PORT}`);
  console.log(`   Local:    http://localhost:${PORT}`);

  // Print all local network IPs so you know what to use
  const interfaces = os.networkInterfaces();
  Object.values(interfaces).forEach(nets => {
    nets.forEach(net => {
      if (net.family === 'IPv4' && !net.internal) {
        console.log(`   Network:  http://${net.address}:${PORT}`);
      }
    });
  });
  console.log('');
});