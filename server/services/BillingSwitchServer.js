const axios = require('axios');
const crypto = require('crypto');

class BillingSwitchServer {
  constructor(apiKey, apiSecret, publicUrl = process.env.SWITCH_BILLING_PUBLIC_URL) {
    this.apiKey = apiKey;
    this.apiSecret = apiSecret;
    this.publicUrl = publicUrl;
    this.filter = [];
  }

  // Ensure required fields are provided before each request
  validateFields() {
    if (!this.apiKey || !this.apiSecret || !this.publicUrl) {
      throw new Error('Missing required API key, secret, or public URL! Make sure all values are provided.');
    }
  }

  generateNonce() {
    const mt = process.hrtime();
    return `${mt[1]}-${Date.now()}-${Math.floor(Math.random() * 1000000)}`;
  }

  generateSignature(postData) {
    this.validateFields(); // Validate required fields before generating signature
    return crypto.createHmac('sha512', this.apiSecret).update(postData).digest('hex');
  }

  async query(req) {
    this.validateFields(); // Validate fields before making an API request
    try {
      const nonce = this.generateNonce();
      req.nonce = nonce;

      const postData = new URLSearchParams(req).toString();
      const sign = this.generateSignature(postData);

      const headers = {
        'key': this.apiKey,
        'sign': sign,
        'Content-Type': 'application/x-www-form-urlencoded'
      };

      const url = `${this.publicUrl}/index.php/${req.module}/${req.action}`;

      const response = await axios.post(url, postData, { headers });

      return response.data;
    } catch (error) {
      if (error.response) {
        console.error('Error Status:', error.response.status);
        console.error('Error in switch-billing server:', error.response.statusText);
      } else if (error.request) {
        console.error('No response received:', error.request);
      } else {
        console.error('Error Message:', error.message);
      }
      return error;
    }
  } 

  async create(module, data = {}, action = 'save') {
    data.module = module;
    data.action = action;
    data.id = 0; // Default ID
    return this.query(data);
  }

  async update(module, id, data) {
    data.module = module;
    data.action = 'save';
    data.id = id;
    return this.query(data);
  }

  async destroy(module, id) {
    return this.query({
      module: module,
      action: 'destroy', 
      id: id
    });
  }

  async read(module, page = 1) {
    return this.query({
      module: module,
      action: 'read',
      page: page,
      start: page === 1 ? 0 : (page - 1) * 25,
      limit: 25,
      filter: JSON.stringify(this.filter)
    });
  }

  clearFilter() {
    this.filter = [];
  }

  setFilter(field, value, comparison = 'st', type = 'string') {
    this.filter.push({
      type,
      field,
      value,
      comparison
    });
  }

  async getId(module, field, value) {
    this.setFilter(field, value, 'eq');
    const query = await this.query({
      module,
      action: 'read',
      page: 1,
      start: 0,
      limit: 1,
      filter: JSON.stringify(this.filter)
    });

    this.clearFilter();

    if (query.rows && query.rows[0]) {
      return query.rows[0].id;
    }
    return null;
  }
}

module.exports = BillingSwitchServer;
