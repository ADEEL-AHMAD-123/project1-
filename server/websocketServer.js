const WebSocket = require('ws');
const fetch = require('node-fetch');
const { authenticateWebSocket } = require('./middlewares/auth');

// WebSocket initialization function
const initWebSocketServer = (server) => {
  const wss = new WebSocket.Server({ server });

  wss.on('connection', async (ws, req) => {
    console.log('New client connected');

    try {
      // Authenticate WebSocket client
      const user = await authenticateWebSocket(req);
      if (!user) {
        console.error('Authentication failed');
        ws.close();
        return;
      }

      const token = req.url.split('?token=')[1];

      // Poll for credit updates and send to client
      const interval = setInterval(async () => {
        await fetchBillingAccountCredit(user.id, ws, token);
      }, 5000); // Poll every 5 seconds

      ws.on('message', (message) => {
        console.log(`Received message from client: ${message}`);
      });

      ws.on('close', () => {
        console.log('Client disconnected');
        clearInterval(interval); // Stop polling when the client disconnects
      });
    } catch (error) {
      console.error('Connection error:', error.message);
      ws.close();
    }
  });

  // Fetch and send billing credit data to the client
  const fetchBillingAccountCredit = async (userId, ws, token) => {
    try {
      const response = await fetch(`http://localhost:8000/api/v1/billing/credit`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (data.success) {
        ws.send(JSON.stringify({ credit: data.credit }));
      } else {
        ws.send(JSON.stringify({ error: 'Failed to fetch credit data' }));
      }
    } catch (error) {
      console.error('Error fetching billing account credit:', error);
      ws.send(JSON.stringify({ error: 'Error fetching billing account credit' }));
    }
  };
};

module.exports = initWebSocketServer;
