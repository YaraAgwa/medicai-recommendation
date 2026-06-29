// Vercel serverless entry point. An Express app is itself a (req, res) handler,
// so exporting it lets Vercel route every request through our normal routes.
module.exports = require('../app');
