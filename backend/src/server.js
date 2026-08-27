const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

// Load environment variables
dotenv.config();

const app = express();

// Connect to MongoDB
if (process.env.NODE_ENV !== 'test') {
  connectDB();
}

// Body parsers & CORS
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Static folder for file uploads
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Health Check Route
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    timestamp: new Date(),
    service: 'Helpdesk Support Ticket API',
    groqEnabled: !!process.env.GROQ_API_KEY
  });
});

// Mount Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/tickets', require('./routes/ticketRoutes'));
app.use('/api/triage', require('./routes/triageRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));

// 404 Handler
app.use((req, res, next) => {
  res.status(404).json({ success: false, message: `Route not found - ${req.originalUrl}` });
});

// Error Handler Middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`=======================================================`);
    console.log(`🚀 Helpdesk Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
    console.log(`⚡ Groq AI Integration: ${process.env.GROQ_API_KEY ? 'Active (API Key loaded)' : 'Disabled'}`);
    console.log(`=======================================================`);
  });
}

module.exports = app;
