const express = require('express');
const cors = require('cors');

const { connect } = require('./database');
const authRoutes = require('./routes/auth');
const profileRoutes = require('./routes/profile');
const questionRoutes = require('./routes/questions');
const doctorRoutes = require('./routes/doctors');
const appointmentRoutes = require('./routes/appointments');
const favoriteRoutes = require('./routes/favorites');
const statsRoutes = require('./routes/stats');
const reviewRoutes = require('./routes/reviews');
const aiRoutes = require('./routes/ai');

const app = express();

app.use(cors());
app.use(express.json());

// Make sure the database is connected before handling any request. connect()
// caches and reuses the connection, so this is safe (and required) on
// serverless platforms like Vercel where each request may hit a fresh instance.
app.use(async (req, res, next) => {
  try {
    await connect();
    next();
  } catch (err) {
    console.error('Database connection failed:', err.message);
    res.status(503).json({ error: 'Database unavailable' });
  }
});

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/favorites', favoriteRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/ai', aiRoutes);

module.exports = app;
