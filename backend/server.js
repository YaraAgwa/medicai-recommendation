// Local / Docker entry point: connect to MongoDB, then start a long-running
// server. (On Vercel the app is served from api/index.js instead — no listen.)
const app = require('./app');
const { connect } = require('./database');

const PORT = process.env.PORT || 5000;

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
