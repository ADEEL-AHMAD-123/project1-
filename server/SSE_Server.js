const { fetchBillingAccountCredit } = require('./utils/switchBillingHelpers');
const { authenticaSSEconnection } = require('./middlewares/auth');

// SSE initialization function
const initSSEServer = (app) => {
  app.get('/sse', async (req, res) => {
    console.log('New SSE client connected');

    try {
      const user = await authenticaSSEconnection(req);
      if (!user) {
        console.error('Authentication failed');
        res.status(401).end();
        return;
      }

      const token = req.query.token;
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');
      res.flushHeaders(); // Ensure headers are sent right away

      const interval = setInterval(async () => {
        try {
          // Use the helper to fetch billing credit data
          const creditData = await fetchBillingAccountCredit(user.id);
          res.write(`data: ${JSON.stringify({ credit: creditData })}\n\n`);
        } catch (error) {
          res.write(`data: ${JSON.stringify({ error: 'Error fetching billing account credit' })}\n\n`);
        }
      }, 5000); // Poll every 5 seconds

      req.on('close', () => {
        console.log('SSE client disconnected');
        clearInterval(interval);
        res.end();
      });
    } catch (error) {
      console.error('Connection error:', error.message);
      res.status(500).end();
    }
  });
};

module.exports = initSSEServer;
