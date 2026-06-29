const express = require('express');
const cors = require('cors');

const { connect } = require('./database');
const authRoutes = require('./routes/auth');
const profileRoutes = require('./routes/profile');
const questionRoutes = require('./routes/questions');
const doctorRoutes = require('./routes/doctors');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/doctors', doctorRoutes);

connect()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`MedicAI API running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Failed to connect to MongoDB:', err.message);
    process.exit(1);
  });
